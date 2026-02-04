import { prisma } from "@repo/db/prisma";

/**
 * Cron job to expire verifications that have passed their expiry date
 * Run this daily or as needed
 */
export const expireVerifications = async () => {
  try {
    console.log("Starting verification expiry check...");
    
    const now = new Date();
    
    // Find all verified properties with expired dates
    const expiredProperties = await prisma.property.findMany({
      where: {
        verificationStatus: "VERIFIED",
        verificationExpiry: {
          lt: now,
        },
      },
      select: {
        id: true,
        title: true,
        verificationExpiry: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (expiredProperties.length === 0) {
      console.log("No expired verifications found.");
      return { success: true, expired: 0 };
    }

    console.log(`Found ${expiredProperties.length} expired verifications`);

    // Update properties to expired status
    await prisma.$transaction([
      // Update property status
      prisma.property.updateMany({
        where: {
          id: {
            in: expiredProperties.map((p: any) => p.id),
          },
        },
        data: {
          verificationStatus: "EXPIRED",
          isVerified: false,
        },
      }),
      // Deactivate verification records
      prisma.propertyVerification.updateMany({
        where: {
          propertyId: {
            in: expiredProperties.map((p: any) => p.id),
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      }),
    ]);

    console.log(`Successfully expired ${expiredProperties.length} verifications`);
    
    // Log expired properties for notification purposes
    expiredProperties.forEach((property: any) => {
      console.log(
        `Expired: ${property.title} (Owner: ${property.owner.firstName} ${property.owner.lastName} - ${property.owner.email})`
      );
    });

    return {
      success: true,
      expired: expiredProperties.length,
      properties: expiredProperties,
    };
  } catch (error) {
    console.error("Error expiring verifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Send reminder notifications to owners whose verification is expiring soon
 * Run this daily to notify owners 7 days before expiry
 */
export const sendExpiryReminders = async () => {
  try {
    console.log("Checking for verifications expiring soon...");
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find verified properties expiring in the next 7 days
    const expiringProperties = await prisma.property.findMany({
      where: {
        verificationStatus: "VERIFIED",
        verificationExpiry: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      select: {
        id: true,
        title: true,
        verificationExpiry: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (expiringProperties.length === 0) {
      console.log("No verifications expiring soon.");
      return { success: true, reminders: 0 };
    }

    console.log(`Found ${expiringProperties.length} verifications expiring within 7 days`);

    // Here you would integrate with your email/SMS service
    // For now, just log the properties
    expiringProperties.forEach((property: any) => {
      const daysLeft = Math.ceil(
        (property.verificationExpiry!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      console.log(
        `Reminder: ${property.title} expires in ${daysLeft} days (Owner: ${property.owner.firstName} ${property.owner.lastName} - ${property.owner.email})`
      );
      
      // TODO: Send email/SMS notification
      // await sendEmail({
      //   to: property.owner.email,
      //   subject: `Your property verification expires in ${daysLeft} days`,
      //   body: `Your verified badge for "${property.title}" will expire on ${property.verificationExpiry?.toLocaleDateString()}. Renew now to keep your verified status!`
      // });
    });

    return {
      success: true,
      reminders: expiringProperties.length,
      properties: expiringProperties,
    };
  } catch (error) {
    console.error("Error sending expiry reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Export function to run both tasks
export const runVerificationMaintenance = async () => {
  console.log("=== Running Verification Maintenance ===");
  
  const expiryResult = await expireVerifications();
  const reminderResult = await sendExpiryReminders();
  
  return {
    expiry: expiryResult,
    reminders: reminderResult,
  };
};
