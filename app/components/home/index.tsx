"use client";
import { Button } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowBigRight } from "@hugeicons/core-free-icons";

export default function HomeComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4">
      <Image src="/logo.png" alt="Logo" width={128} height={128} />
      <h1 className="text-4xl font-bold">Welcome to Mehfil</h1>
      <p className="text-lg text-gray-600">A place to connect with friends and family.</p>
      <Link href="/login"><Button color="primary" variant="flat">Staff Login<HugeiconsIcon icon={ArrowBigRight} /></Button></Link>
    </div>
  );
}
