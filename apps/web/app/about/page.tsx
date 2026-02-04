"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Eye, Shield, Heart } from "lucide-react";
import heroProperty from "@/assets/hero-property.jpg";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description:
        "Every property owner is KYC verified and properties are personally inspected by our team.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "We focus on building communities, not just providing rooms. Connect with like-minded people.",
    },
    {
      icon: Heart,
      title: "Student Focused",
      description:
        "Built for students and young professionals with budgets, flexibility and comfort in mind.",
    },
  ];

  const milestones = [
    {
      year: "2026",
      title: "Founded",
      description:
        "roomkarts was started to solve real housing problems with a transparent platform.",
    },
    {
      year: "2027",
      title: "10000+ Properties Target",
      description:
        "Goal to onboard 10000+ verified properties with high quality listings and active support.",
    },
    {
      year: "2028",
      title: "Fastest Growing",
      description:
        "Aim to become one of the fastest growing housing platforms in India.",
    },
    {
      year: "2029",
      title: "AI-Integrated Workflows",
      description:
        "Deep AI integrations to boost matching, verification and customer support experience.",
    },
  ];
  // Scroll handler for 'Our Mission' button
  const handleMissionClick = () => {
    const el = document.getElementById('future-goals-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative min-h-screen bg-background"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <title>
        About roomkarts - Trusted Student Housing Platform | Our Story
      </title>

      {/* HERO: split layout */}
      <section className="relative overflow-hidden border-b bg-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_55%)] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto">
            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <Badge
                variant="secondary"
                className="trust-badge text-xs sm:text-sm"
              >
                About RoomKarts
              </Badge>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                  Making housing simple, safe and transparent.
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl">
                  RoomKarts is a modern real estate platform that connects
                  property owners and tenants directly — without confusion,
                  or hidden charges.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="text-sm sm:text-base px-6 py-2 rounded-lg" onClick={handleMissionClick}>
                  <Target className="w-5 h-5 mr-2" />
                  Our Mission
                </Button>
                <Button
                  variant="outline"
                  className="text-sm sm:text-base px-6 py-2 rounded-lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Our Community
                </Button>
              </div>

              {/* Small stats strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                <div className="rounded-xl border bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Founded</p>
                  <p className="text-lg font-semibold">2026</p>
                </div>
                <div className="rounded-xl border bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    Targeted properties
                  </p>
                  <p className="text-lg font-semibold">10000+</p>
                </div>
                <div className="rounded-xl border bg-background/60 p-3 hidden sm:block">
                  <p className="text-xs text-muted-foreground">
                    Focused cities
                  </p>
                  <p className="text-lg font-semibold">Delhi NCR</p>
                </div>
              </div>
            </motion.div>

            {/* Right image block */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative h-64 sm:h-80 md:h-[420px]"
            >
              {/* Main image card */}
              <div className="relative h-full w-full rounded-3xl overflow-hidden border bg-background shadow-xl">
                <Image
                  src={heroProperty.src}
                  alt="Students exploring verified properties on RoomKarts"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              </div>

              {/* Floating mini card */}
              <div className="hidden sm:block absolute -bottom-5 -left-3 md:-left-6">
                <Card className="shadow-lg border bg-background/95 backdrop-blur-sm">
                  <CardContent className="px-4 py-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Verified & inspected
                    </p>
                    <p className="text-sm font-semibold">
                      Trust & transparency first
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE / FEATURES */}
      {/* WHO WE ARE / FEATURES */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="space-y-3 text-center md:text-left">
              <Badge variant="secondary" className="trust-badge">
                Who we are
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Built for owners and students.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto md:mx-0">
                On RoomKarts, property owners can list unlimited Flats, Rooms,
                PGs, Houses and Villas for rent or sale while students get a
                clean, filter-based search to find the right place faster.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
              {/* Left: features grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Unlimited listings
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Owners can add multiple properties with no cap — perfect
                      for PG owners, agents, or landlords with more inventory.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Property verification (₹149)
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Optional verification badge per listing so students know
                      which properties are verified and inspected.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Advanced search
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Filter by location, property type, budget, sharing type
                      and more — no scrolling endless random posts.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Online rent agreement (₹100)
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Generate digital rent agreements for both owner and
                      tenant in minutes, no offline paperwork required.
                    </p>
                  </CardContent>
                </Card>

                <Card className="sm:col-span-2">
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Secure online payments
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      All transactions are routed via Razorpay with encrypted,
                      secure payment flow for peace of mind.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right: why + company info */}
              <div className="space-y-4">
                <Card className="bg-muted/60">
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Why choose RoomKarts?
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <li>Transparent pricing with no hidden charges.</li>
                      <li>Secure and trusted payment processing.</li>
                      <li>Direct owner–student interaction, no middleman.</li>
                      <li>Verified listings for higher trust.</li>
                      <li>Digital-first, mobile friendly experience.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">
                      Company details
                    </h3>
                    <div>Founded: 2026</div>
                    <div>Headquarters: India</div>
                    <div>
                      Contact:{" "}
                      <a
                        href="mailto:roomkartsbusiness@gmail.com"
                        className="text-primary underline"
                      >
                        roomkartsbusiness@gmail.com
                      </a>
                    </div>
                    <div>
                      For partnership and business queries, reach out to our
                      team anytime.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-12 sm:py-16 md:py-18 bg-muted/30 border-y">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-8 sm:mb-10">
            <Badge variant="secondary" className="trust-badge">
              Our values
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">
              What drives RoomKarts.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              These principles shape how we build, grow and support the
              platform every single day.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.05,
                }}
              >
                <Card className="h-full text-center">
                  <CardContent className="p-5 sm:p-6 flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <value.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold">
                      {value.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section id="future-goals-section" className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-8 sm:mb-10">
            <Badge className="trust-badge">Future goals</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Our roadmap for the next years.
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{
                  opacity: 0,
                  x: index % 2 ? 40 : -40,
                }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex items-start gap-4 sm:gap-5"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + CONTACT */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary/5 border-t">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to find your next home?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse verified listings, talk to owners directly and close your
              rent agreement online without leaving your room.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <Link href="/properties">
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                  <Button className="btn-hero w-full sm:w-auto" size="lg">
                    <Eye className="w-5 h-5 mr-2" />
                    Browse properties
                  </Button>
                </motion.div>
              </Link>

              <Dialog>
                <DialogTrigger asChild>
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Contact us
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="bg-white text-black border border-gray-200 shadow-2xl max-w-lg w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        Share your details
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-700">
                        Our team will get back to you with options matching your
                        requirements.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      className="space-y-4 mt-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        try {
                          localStorage.setItem("contactIntent", "true");
                        } catch {};
                      }}
                    >
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input placeholder="Your name" required />
                        <Input type="email" placeholder="Email" required />
                      </div>
                      <Input placeholder="Phone" required />
                      <Textarea
                        rows={4}
                        placeholder="Tell us briefly what you need"
                      />
                      <div className="flex justify-end">
                        <Button type="submit" className="btn-hero">
                          Send
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
