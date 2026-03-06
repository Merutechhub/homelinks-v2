import { Route, Switch, Redirect } from "wouter";
import {
  LandingPage,
  EmailVerificationPage,
} from "./pages";
import { AppShell } from "./components/layout";
import { useAuthStore } from "./store/authStore";

/* ──────────────────────────────────────────────────────────────
   App — Root router with auth guards
   ────────────────────────────────────────────────────────────── */

/** Wrap authenticated routes inside AppShell */
function AuthRoute({ component: Comp }: { component: React.FC }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect to="/" />;
  return (
    <AppShell>
      <Comp />
    </AppShell>
  );
}

/** Redirect away from auth pages if already logged in */
function GuestRoute({ component: Comp }: { component: React.FC }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Redirect to="/" />;
  return <Comp />;
}

/* Placeholder pages for routes we haven't built yet */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container-app py-16 text-center space-y-4">
      <h1 className="text-headline text-text-primary">{title}</h1>
      <p className="text-body text-text-secondary">
        Coming soon — under construction 🚧
      </p>
    </div>
  );
}

const Explore = () => <PlaceholderPage title="Explore" />;
const Housing = () => <PlaceholderPage title="Housing" />;
const Marketplace = () => <PlaceholderPage title="Marketplace" />;
const Messages = () => <PlaceholderPage title="Messages" />;
const Profile = () => <PlaceholderPage title="Profile" />;
const CreateListing = () => <PlaceholderPage title="Create Listing" />;

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Switch>
      {/* Public */}
      <Route path="/">
        {isAuthenticated ? <Redirect to="/explore" /> : <LandingPage />}
      </Route>

      {/* Guest‑only (auth pages) */}
      <Route path="/onboarding/verify-email">
        <GuestRoute component={EmailVerificationPage} />
      </Route>

      {/* Authenticated */}
      <Route path="/explore">
        <AuthRoute component={Explore} />
      </Route>
      <Route path="/housing">
        <AuthRoute component={Housing} />
      </Route>
      <Route path="/marketplace">
        <AuthRoute component={Marketplace} />
      </Route>
      <Route path="/messages">
        <AuthRoute component={Messages} />
      </Route>
      <Route path="/profile">
        <AuthRoute component={Profile} />
      </Route>
      <Route path="/create">
        <AuthRoute component={CreateListing} />
      </Route>

      {/* 404 fallback */}
      <Route>
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
          <div className="text-center space-y-3">
            <h1 className="text-display text-text-primary">404</h1>
            <p className="text-body text-text-secondary">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}
