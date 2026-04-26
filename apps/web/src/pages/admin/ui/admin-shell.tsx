import { Outlet } from "react-router-dom";

export function AdminShell() {
  return (
    <section className="space-y-8">
      <Outlet />
    </section>
  );
}
