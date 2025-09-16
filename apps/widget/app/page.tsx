"use client";

import { WidgetView } from "@/module/widget/ui/views/widget-view";
import { use } from "react";

interface Props {
  searchParams: Promise<{
    organizationId: string;
  }>
}
const Page =async  ({ searchParams }: Props) => {
  const { organizationId } = use(searchParams);
  return (
    <WidgetView organizationId={organizationId} />
  );
};

export default Page;
