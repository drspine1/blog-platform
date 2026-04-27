'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, staggerContainer, staggerItem, viewport } from '@/components/motion';

interface CategoryItem {
  name: string;
  count: number;
  href: string;
  label: string;
}

export default function AnimatedCategoryGrid({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No categories found.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {categories.map((category) => (
        <motion.div key={category.name} variants={staggerItem}>
          <Link
            href={category.href}
            className="group block rounded-lg border border-border bg-card p-8 transition-all hover:border-accent hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{category.label}</p>
              </div>
              <ChevronRight className="h-6 w-6 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
