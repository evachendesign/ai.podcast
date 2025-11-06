"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Radio, ArrowRight } from "lucide-react";

interface ChannelCardProps {
  id: string;
  name: string;
  description?: string;
  episodeCount?: number;
  onGoToChannel?: (id: string) => void;
}

export function ChannelCard({
  id,
  name,
  description,
  episodeCount = 0,
  onGoToChannel,
}: ChannelCardProps) {
  return (
    <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-1">{name}</CardTitle>
            {description && (
              <CardDescription className="mt-1.5 line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/channels/${id}`} className="w-full">
          <Button
            className="w-full gap-2 group-hover:gap-3 transition-all"
            variant="default"
          >
            Go to Channel
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

