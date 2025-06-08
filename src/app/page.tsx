import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to TaskFlow
        </h1>
        <p className="text-xl text-muted-foreground">
          A professional task management application that combines the best features 
          of Trello, Microsoft Planner, and Lists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/boards">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}