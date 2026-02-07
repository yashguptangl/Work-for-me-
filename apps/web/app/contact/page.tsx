"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Mail, MapPin, Clock } from "lucide-react";
import heroProperty from "@/assets/hero-property.jpg";
import Image from "next/image";
import { motion } from "framer-motion";

const ContactPage = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Validate phone number input
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate phone number
    if (form.phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3001/api/v1/contact/general-contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setError("Failed to send. Please try again later.");
      }
    } catch {
      setError("Failed to send. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/60 via-background to-background">
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
        {/* HERO + INTRO */}
        <section className="mb-8 sm:mb-10 md:mb-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-4"
          >
            <Badge variant="secondary" className="w-max text-xs sm:text-sm">
              Get in touch
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Contact RoomKarts Support
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Have questions about listings, verification, payments or rent
              agreements? Send us your details and our team will reach out with
              the best possible help.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 pt-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm font-medium">+91 9719507080</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-medium">roomkartsbusiness@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Office address
                  </p>
                  <p className="text-sm font-medium">
                    Nagal , Saharanpur , Uttar Pradesh, India - 247551
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Support hours
                  </p>
                  <p className="text-sm font-medium">
                    Mon – Sat, 10:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Business Name
                  </p>
                  <p className="text-sm font-medium">
                    RoomKarts
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: image card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-52 sm:h-64 md:h-72 lg:h-80"
          >
            <div className="relative h-full w-full overflow-hidden rounded-3xl border bg-card shadow-xl">
              <Image
                src={heroProperty.src}
                alt="Contact RoomKarts"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">
                  Support made simple
                </p>
                <p className="text-sm sm:text-base font-semibold text-white">
                  Tell us what you need, we will guide you step by step.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* MAIN FORM + SIDE INFO */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          {/* Form card */}
          <Card className="border bg-card/90 backdrop-blur-sm shadow-sm">
            <CardContent className="py-6 sm:py-7 md:py-8 px-4 sm:px-6 md:px-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">
                Send us a message
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                Fill in the form and our team will connect with you over call or
                email as soon as possible.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">
                      Full name
                    </label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium">
                    Phone number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Please enter a valid 10-digit Indian mobile number.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium">
                    How can we help?
                  </label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Share your query, property need, or issue in brief."
                  />
                </div>

                {error && <div className="text-xs text-red-600">{error}</div>}
                {success && (
                  <div className="text-xs text-green-600">
                    Thank you! We have received your message.
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" className="btn-hero" disabled={loading}>
                    {loading ? "Sending..." : "Send message"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Side info / for Razorpay & users */}
          <div className="space-y-4">
            <Card className="border bg-card/90 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold">
                  Contact details (for support)
                </h3>
                <div className="mt-2 space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      Registered Name:
                    </span>{" "}
                    RoomKarts
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Operational Address:
                    </span>{" "}
                      Nagal , Saharanpur , Uttar Pradesh, India - 247551
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Support Email:
                    </span>{" "}
                    <a
                      href="mailto:roomkartsbusiness@gmail.com"
                      className="text-primary underline"
                    >
                      roomkartsbusiness@gmail.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-muted/70 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-2">
                <h3 className="text-sm sm:text-base font-semibold">
                  Before you submit
                </h3>
                <ul className="list-disc pl-4 text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>
                    For payment issues, keep your transaction ID and date handy.
                  </li>
                  <li>
                    For property issues, mention property ID or location
                    details.
                  </li>
                  <li>We usually respond within 24–48 working hours.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Dialog CTA */}
            <Dialog open={open} onOpenChange={setOpen}>
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
                    Open contact form
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
                  <form className="space-y-4 mt-3" onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                      />
                    </div>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                      required
                    />
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us briefly what you need"
                    />
                    {error && (
                      <div className="text-xs text-red-600">{error}</div>
                    )}
                    {success && (
                      <div className="text-xs text-green-600">
                        Thank you! We have received your message.
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="btn-hero"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
