import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/contexts/auth.context";
import { useApi } from "@/core/contexts/api.context";
import {
  PROFILE_SECTION_IDS,
  ProfileHeader,
  ProfileNav,
  PersonalInfoSection,
  AddressSection,
  SecuritySection,
  ProfileNotSignedIn,
} from "./profile.component";

export default function Profile() {
  const navigate = useNavigate();
  const { user, changePassword, logout } = useAuth();
  const { wishlist } = useApi();

  const [activeSection, setActiveSection] = useState(PROFILE_SECTION_IDS[0]);

  // Saved item count comes from the wishlist module
  useEffect(() => {
    if (user && typeof wishlist?.fetchAll === "function") wishlist.fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Highlight the menu item for the section currently in view
  useEffect(() => {
    if (!user) return undefined;

    const els = PROFILE_SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter(Boolean);
    if (!els.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [user]);

  const handleNavSelect = (item) => {
    if (item.type === "link") {
      navigate(item.to);
      return;
    }
    document
      .getElementById(item.id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(item.id);
  };

  // AuthProvider already shows its loader while the session loads,
  // so by the time this renders we either have a user or we don't.
  if (!user) return <ProfileNotSignedIn />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <ProfileHeader
        user={user}
        savedCount={(wishlist?.list || []).length}
        onLogout={logout}
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <ProfileNav
          activeSection={activeSection}
          onSelect={handleNavSelect}
          onLogout={logout}
        />

        <div className="min-w-0 space-y-6">
          <PersonalInfoSection user={user} />
          <AddressSection user={user} />
          <SecuritySection
            user={user}
            onChangePassword={changePassword}
            onLogout={logout}
          />
        </div>
      </div>
    </div>
  );
}