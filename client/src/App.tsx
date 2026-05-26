import { Switch, Route } from "wouter";

import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import ManageBooking from "@/pages/ManageBooking";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reserva/:token" component={ManageBooking} />

      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}