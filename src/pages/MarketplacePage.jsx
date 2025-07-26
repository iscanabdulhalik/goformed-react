import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const marketplaceData = [
  {
    title: "ITIN",
    description:
      "ITIN allows access to more US banks, build credit history, and support your U.S. VISA. Read more...",
    price: "$297",
    term: "Total amount",
  },
  {
    title: "Logo Design",
    description:
      "Get 3 original, custom-made logos tailored to your business style and preferences — 100% unique. Read more...",
    price: "$50",
    term: "Total amount",
  },
  {
    title: "EIN",
    description:
      "Get your EIN in just 2-5 business days as a non-US resident. Read more...",
    price: "$60",
    term: "Total amount",
  },
  {
    title: "UK Proof of Address",
    description:
      "Obtain a UK proof of address accepted by Stripe and UK online banking services. Read more...",
    price: "$129",
    term: "/y",
  },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">
          Enhance your business with our additional services.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {marketplaceData.map((item, index) => (
          <Card
            key={item.title}
            className="flex flex-col animate-in fade-in-50"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-4">
              <div className="font-semibold">
                <span className="text-2xl">{item.price}</span>
                <span className="text-sm text-muted-foreground">
                  {" "}
                  {item.term}
                </span>
              </div>
              <Button>Order</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
