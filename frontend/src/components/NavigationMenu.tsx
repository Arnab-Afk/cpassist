import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <NavigationMenu className="z-5">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>DSA Topics</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
            <ul className="grid w-[500px] gap-3 p-2 lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-base p-6 no-underline outline-hidden"
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
        
        <NavigationMenuItem>
          <Link to="/profile">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Profile
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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
            "hover:bg-accent block text-main-foreground select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-hidden transition-colors hover:border-border",
            className,
          )}
          to={href}
          {...props}
        >
          <div className="text-base font-heading leading-none">{title}</div>
          <p className="font-base line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
