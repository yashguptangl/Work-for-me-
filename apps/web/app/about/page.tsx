"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Heart,
  Award,
  Target,
  Eye
} from 'lucide-react';
import heroProperty from '@/assets/hero-property.jpg';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every property owner is KYC verified. Every property is personally inspected by our team.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building communities, not just providing accommodation. Connect with like-minded people.'
    },
    {
      icon: Heart,
      title: 'Student Focused',
      description: 'Designed specifically for students and young professionals. We understand your unique needs.'
    }
  ];


  const team = [
    {
      name: 'Yash Gupta',
      role: 'Founder & CEO',
      description: 'Co-founder leading product and growth at Rooms Dekho.',
      image: heroProperty,
    },
    {
      name: 'Saurabh Kr. Jha',
      role: 'Co-founder & CTO',
      description: 'Co-founder overseeing operations and partnerships.',
      image: heroProperty,
    },
  ];

  const milestones = [
    { year: '2025', title: 'Founded', description: 'Rooms Dekho was founded with a vision to solve student housing challenges' },
    { year: '2026', title: '1000+ Users Target', description: 'Aim to onboard 1000+ verified users with quality listings and support' },
    { year: '2027', title: 'Fastest Growing Company', description: 'Target to become one of the fastest growing housing platforms' },
    { year: '2028', title: 'AI-Integrated Workflows', description: 'Deep AI integrations to enhance matching, verification and support' },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      {/* SEO Meta */}
      <title>About Rooms Dekho - Trusted Student Housing Platform | Our Story</title>

      {/* Hero Section with animation and soft gradient background */}
      <section className="relative py-20 bg-primary/5 overflow-hidden">
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.08),transparent_40%)]"
        />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="container mx-auto px-4 text-center"
        >
          <Badge variant="secondary" className="mb-2 trust-badge">
            <Award className="w-4 h-4 mr-1" />
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">Rooms Dekho</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're on a mission to make finding safe, affordable, and comfortable accommodation 
            as easy as connecting with friends. Every student deserves a home away from home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
              <Button className="btn-hero">
                <Target className="w-5 h-5 mr-2" />
                Our Mission
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
              <Button variant="outline" size="lg">
                <Users className="w-5 h-5 mr-2" />
                Join Our Community
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center md:[perspective:1200px]">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <Badge variant="secondary" className="mb-4 trust-badge">Our Story</Badge>
              <h2 className="text-3xl font-bold mb-6">
                Started by Students, Built for Students
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Rooms Dekho was born out of personal frustration. As students ourselves, we experienced 
                  the challenges of finding safe, affordable, and reliable accommodation in new cities.
                </p>
                <p>
                  From dealing with unverified landlords to paying hefty broker fees, from unsafe neighborhoods 
                  to hidden charges - we've been through it all. That's why we created Rooms Dekho - to ensure 
                  no student has to go through the same struggles we did.
                </p>
                <p>
                  Today, we're proud to have helped over 10,000 students find their perfect home across 50+ cities 
                  in India. Our platform has become the most trusted name in student accommodation.
                </p>
              </div>
            </motion.div>
            <motion.div className="relative w-full h-[300px] md:h-[360px] [transform-style:preserve-3d]" initial={{ opacity: 0, rotateY: -15, y: 24 }} whileInView={{ opacity: 1, rotateY: 0, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} viewport={{ once: true }} whileHover={{ y: -6, scale: 1.02 }}>
              <Image 
                src={heroProperty} 
                alt="Our story"
                fill
                className="rounded-lg shadow-[var(--shadow-property)] object-cover"
                priority={false}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-16">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 trust-badge">Our Values</Badge>
            <h2 className="text-3xl font-bold mb-4">What We Stand For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:[perspective:1200px]">
            {values.map((value, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 24, rotateY: -10 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.02 }} className="[transform-style:preserve-3d]">
                <Card className="property-card text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 trust-badge">Future Goals</Badge>
            <h2 className="text-3xl font-bold mb-4">What We Are Building Next</h2>
          </div>

          <div className="max-w-4xl mx-auto md:[perspective:1200px]">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: index % 2 ? 30 : -30, rotateY: index % 2 ? 8 : -8 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="flex items-start space-x-6 [transform-style:preserve-3d]">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-16">
          <div className="text-center mb-12">
            <Badge className="mb-4 trust-badge">Meet the Team</Badge>
            <h2 className="text-3xl font-bold mb-4">The People Behind Rooms Dekho</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A passionate team of developers, designers, and real estate experts working to revolutionize student housing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:[perspective:1200px]">
            {team.map((member, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 24, rotateY: -10 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.02 }} className="[transform-style:preserve-3d]">
                <Card className="property-card text-center">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <div className="text-primary font-medium mb-3">{member.role}</div>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of students who have found their perfect accommodation through Rooms Dekho.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                <Button className="btn-hero" size="lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Browse Properties
                </Button>
              </motion.div>
            </Link>

            <Dialog>
              <DialogTrigger asChild>
                <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                  <Button variant="outline" size="lg">
                    <Users className="w-5 h-5 mr-2" />
                    Contact Us
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="[perspective:1200px] bg-white text-black border border-gray-200 shadow-2xl z-[100]">
                <motion.div initial={{ opacity: 0, rotateY: -10, y: 10 }} animate={{ opacity: 1, rotateY: 0, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="[transform-style:preserve-3d]">
                  <DialogHeader>
                    <DialogTitle className="text-black">Send your contact details</DialogTitle>
                    <DialogDescription className="text-gray-700">We'll reach out shortly to assist you.</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); try { localStorage.setItem('contactIntent', 'true'); } catch {} }}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="Your name" required />
                      <Input type="email" placeholder="Email" required />
                    </div>
                    <Input placeholder="Phone" required />
                    <Textarea rows={4} placeholder="Tell us briefly what you need" />
                    <div className="flex justify-end">
                      <Button type="submit" className="btn-hero">Send</Button>
                    </div>
                  </form>
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;