import React from "react";
import { FaGlobeEurope } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center pt-8 md:pt-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Ready to Launch Your Business?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          We provide a seamless, fully-remote incorporation service for global
          entrepreneurs.
        </p>
      </div>

      <Card className="w-full max-w-2xl animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <FaGlobeEurope className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">
            Incorporate in the United Kingdom
          </CardTitle>
          <CardDescription>
            The complete package to start and manage your UK company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-4xl font-extrabold">
              $197{" "}
              <span className="text-lg font-normal text-muted-foreground">
                one-time fee
              </span>
            </p>
            <p className="text-muted-foreground">
              + $59/year starting the second year.
            </p>
          </div>
          <Button className="w-full" size="lg">
            Start My Company
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
