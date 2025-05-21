import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import { useMobileMenu } from '@/lib/MobileMenuContext';
import { useAuth } from '@/lib/AuthContext';

const dsaTopics: { title: string; href: string; description: string }[] = [
  {
    title: "Arrays & Strings",
    href: "/topics/arrays-strings",
    description:
      "Basic data structures for storing and manipulating collections of elements.",
  },
  {
    title: "Linked Lists",
    href: "/topics/linked-lists",
    description:
      "A linear data structure consisting of nodes where each node points to the next node.",
  },
  {
    title: "Stacks & Queues",
    href: "/topics/stacks-queues",
    description:
      "Abstract data types with specialized methods for insertion and removal of elements.",
  },
  {
    title: "Trees & Graphs",
    href: "/topics/trees-graphs",
    description: 
      "Hierarchical data structures for representing relationships between nodes.",
  },
  {
    title: "Dynamic Programming",
    href: "/topics/dynamic-programming",
    description:
      "Optimization technique that breaks down complex problems into simpler subproblems.",
  },
  {
    title: "Sorting & Searching",
    href: "/topics/sorting-searching",
    description:
      "Algorithms for arranging elements in a specific order and efficiently finding elements.",
  },
];

export default function MainNavigationMenu() {
  const { toggleMobileMenu } = useMobileMenu();
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <>
      {/* Desktop Navigation Menu */}
      <NavigationMenu className="z-50 hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>DSA Topics</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[95vw] max-w-[400px] gap-3 p-2 md:w-[500px] md:max-w-none md:grid-cols-2 lg:w-[600px]">
                {dsaTopics.map((topic) => (
                  <ListItem
                    key={topic.title}
                    title={topic.title}
                    href={topic.href}
                  >
                    {topic.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <NavigationMenuTrigger>Practice</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[95vw] max-w-[400px] gap-3 p-2 md:w-[500px] md:max-w-none grid-cols-1 lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-1 lg:row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md p-4 md:p-6 no-underline outline-hidden dark:text-white bg-muted/50 dark:bg-gray-800/50 border border-border dark:border-gray-700 shadow-sm"
                      to="/questions"
                    >
                      <div className="mb-2 mt-4 text-lg font-heading">
                        DSA Questions
                      </div>
                      <p className="text-sm font-base leading-tight">
                        Practice curated DSA problems organized by difficulty and topic.
                        Track your progress and improve your problem-solving skills.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/questions/easy" title="Easy Problems">
                  Build your foundation with introductory problems suitable for beginners.
                </ListItem>
                <ListItem href="/questions/medium" title="Medium Problems">
                  Challenge yourself with intermediate problems to strengthen your skills.
                </ListItem>
                <ListItem href="/questions/hard" title="Hard Problems">
                  Test your expertise with complex problems that appear in top competitions.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/progress">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Progress Tracker
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          {isAuthenticated ? (
            <>
              <NavigationMenuItem>
                <Link to="/profile">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Profile
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/" onClick={(e) => { e.preventDefault(); logout(); }}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Logout
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </>
          ) : (
            <NavigationMenuItem>
              <Link to="/login">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden flex items-center">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-md focus:outline-none hover:bg-accent/30 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </>
  );
}

function ListItem({
  className,
  title,
  children,
  href,
  ...props
}: React.ComponentProps<"a"> & { href: string; title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            "hover:bg-accent/10 block select-none space-y-1 rounded-base border-2 border-transparent p-2 md:p-3 leading-none no-underline outline-hidden transition-colors hover:border-border dark:hover:border-gray-600 dark:text-white",
            className,
          )}
          to={href}
          {...props}
        >
          <div className="text-sm md:text-base font-heading leading-none">{title}</div>
          <p className="font-base line-clamp-2 text-xs md:text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
