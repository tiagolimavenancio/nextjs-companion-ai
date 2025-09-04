import React from "react";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) redirectToSignIn();

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId,
    },
  });

  const categories = await prismadb.category.findMany();

  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
