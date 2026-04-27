'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { motion, fadeUp, fadeIn, slideLeft, slideRight, staggerContainer, staggerItem, scaleUp, viewport } from '@/components/motion';
import { BlogCard } from '@/components/blog-card';
import type { PostMetadata } from '@/lib/posts';

interface HeroProps {
  badge: string;
  heroTitle: string;
  heroDesc: string;
  startLearning: string;
  browseCategories: string;
  blogHref: string;
  categoriesHref: string;
}

export function HeroSection({ badge, heroTitle, heroDesc, startLearning, browseCategories, blogHref, categoriesHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — text */}
          <motion.div variants={slideLeft} initial="hidden" animate="visible">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2"
              variants={fadeIn} initial="hidden" animate="visible"
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{badge}</span>
            </motion.div>

            <motion.h1
              className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance"
              variants={fadeUp} initial="hidden" animate="visible"
              transition={{ delay: 0.2 }}
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              className="mb-8 text-lg text-muted-foreground text-balance"
              variants={fadeUp} initial="hidden" animate="visible"
              transition={{ delay: 0.35 }}
            >
              {heroDesc}
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row"
              variants={fadeUp} initial="hidden" animate="visible"
              transition={{ delay: 0.5 }}
            >
              <Link href={blogHref} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-all hover:shadow-lg hover:scale-105 active:scale-95">
                {startLearning}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={categoriesHref} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                {browseCategories}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — hero image */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            variants={slideRight} initial="hidden" animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-4 rounded-2xl bg-accent/10 blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="SEO analytics dashboard"
                className="relative rounded-2xl border border-border shadow-2xl object-cover w-full"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface FeaturesProps {
  featuresTitle: string;
  features: { iconName: 'BookOpen' | 'TrendingUp' | 'Sparkles'; title: string; desc: string }[];
}

export function FeaturesSection({ featuresTitle, features }: FeaturesProps) {
  const iconMap = { BookOpen, TrendingUp, Sparkles };

  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="mb-12 text-center text-3xl font-bold text-foreground"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
        >
          {featuresTitle}
        </motion.h2>
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}
        >
          {features.map(({ iconName, title, desc }) => {
            const Icon = iconMap[iconName];
            return (
              <motion.div
                key={title}
                variants={staggerItem}
                className="rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-accent/10 p-3">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

interface FeaturedPostsProps {
  featuredTitle: string;
  featuredDesc: string;
  viewAll: string;
  viewAllArticles: string;
  blogHref: string;
  posts: PostMetadata[];
  locale: string;
}

export function FeaturedPostsSection({ featuredTitle, featuredDesc, viewAll, viewAllArticles, blogHref, posts, locale }: FeaturedPostsProps) {
  return (
    <section className="border-b border-border bg-card py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 flex items-end justify-between"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground">{featuredTitle}</h2>
            <p className="mt-2 text-muted-foreground">{featuredDesc}</p>
          </div>
          <Link href={blogHref} className="hidden items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80 sm:flex">
            {viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}
        >
          {posts.map((post) => (
            <motion.div key={post.slug} variants={staggerItem}>
              <BlogCard post={post} locale={locale} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 flex sm:hidden"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
        >
          <Link href={blogHref} className="w-full rounded-lg border border-border bg-background px-6 py-3 text-center font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            {viewAllArticles}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

interface CTAProps {
  ctaTitle: string;
  ctaDesc: string;
  exploreGuides: string;
  blogHref: string;
}

export function CTASection({ ctaTitle, ctaDesc, exploreGuides, blogHref }: CTAProps) {
  return (
    <motion.section
      className="bg-background py-16 sm:py-20"
      variants={scaleUp} initial="hidden" whileInView="visible" viewport={viewport}
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold text-foreground">{ctaTitle}</h2>
        <p className="mb-8 text-lg text-muted-foreground">{ctaDesc}</p>
        <Link href={blogHref} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 font-medium text-accent-foreground transition-all hover:shadow-lg hover:scale-105 active:scale-95">
          {exploreGuides}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.section>
  );
}
