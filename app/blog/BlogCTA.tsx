"use client";

import { useState } from "react";
import WaitlistModal from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function BlogCTA() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4 mr-2" />
        Notify me when posts publish
      </Button>
      <WaitlistModal open={open} onOpenChange={setOpen} />
    </>
  );
}
