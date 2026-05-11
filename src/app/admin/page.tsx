"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPlanConfig, PLAN_LIST } from "@/lib/plans";
import { getSubscriptionDaysLeft, getSubscriptionEndDate } from "@/lib/subscriptions";

type Profile = {
  id: string;
  type: string | null;
  name: string | null;
  whatsapp: string | null;
  location: string | null;
  description: string | null;
  active_plan: string | null;
  is_online: boolean | null;
  profile_verified: boolean | null;
  profile_approval_status: "pending" | "approved" | "rejected" | null;
  user_document_path: string | null;
  user_document_name: string | null;
  user_document_back_path: string | null;
  user_document_back_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProfileMedia = {
  id: string;
  profile_id: string;
  user_id: string;
  file_name: string | null;
  media_type: "photo" | "video";
  public_url: string | null;
  storage_path: string;
  approval_status: "pending" | "approved" | "rejected";
  is_cover: boolean | null;
  created_at: string | null;
  profiles?: {
    name: string | null;
    type: string | null;
    location: string | null;
  } | null;
};

type Subscription = {
  id?: string;
  user_id?: string;
  profile_id?: string;
  plan?: string;
  plan_key?: string;
  status?: string;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
};

type PartnershipPromotion = {
  id: string;
  title: string;
  partner_name: string;
  description: string;
  promotion_label: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
};

type AdminContact = {
  id: string;
  name: string;
  phone: string;
  phone_normalized: string | null;
  sale_closed: boolean;
  admin_user_id: string | null;
  admin_name: string;
  admin_email: string | null;
  sale_closed_at: string | null;
  sale_closed_by_admin_user_id: string | null;
  sale_closed_by_admin_name: string | null;
  sale_closed_by_admin_email: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const emptyPartnershipForm = {
  title: "",
  partner_name: "",
  description: "",
  promotion_label: "",
  image_url: "",
  link_url: "",
  sort_order: "0",
  is_active: true,
};

const emptyContactForm = {
  name: "",
  phone: "",
  sale_closed: false,
};

const DOCUMENTS_PER_PAGE = 10;
const PROFILES_PER_PAGE = 10;
const SUBSCRIPTIONS_PER_PAGE = 10;
const CONTACTS_PER_PAGE = 10;

const emptyProfileEditForm = {
  name: "",
  type: "mulher",
  whatsapp: "",
  location: "",
  active_plan: "Basico",
  plan_days: "30",
  is_online: false,
  profile_approval_status: "pending" as "pending" | "approved",
  new_password: "",
};

const normalizeProfileMediaRows = (rows: unknown[]): ProfileMedia[] => {
  return rows.map((row) => {
    const item = row as ProfileMedia & { profiles?: ProfileMedia["profiles"] | ProfileMedia["profiles"][] };
    const linkedProfile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;

    return {
      ...item,
      profiles: linkedProfile || null,
    };
  });
};

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@delirioprive.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const formatDateTimeSP = (value?: string | null) => {
  if (!value) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
};

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const pendingProfileDocuments = (profiles: Profile[]) => {
  return profiles.filter((profile) => profile.profile_approval_status === "pending" && (profile.user_document_path || profile.user_document_back_path));
};

const allProfileDocuments = (profiles: Profile[]) => {
  return profiles.filter((profile) => profile.user_document_path || profile.user_document_back_path);
};

const getPlanAmount = (price: string) => {
  const normalizedPrice = price.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
  const amount = Number(normalizedPrice);
  return Number.isFinite(amount) ? amount : 0;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("aprovacoes");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [contactStatus, setContactStatus] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; name: string; email: string | null } | null>(null);
  const [partnerships, setPartnerships] = useState<PartnershipPromotion[]>([]);
  const [partnershipForm, setPartnershipForm] = useState(emptyPartnershipForm);
  const [partnershipStatus, setPartnershipStatus] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentPage, setDocumentPage] = useState(1);
  const [profilePage, setProfilePage] = useState(1);
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const [acceptedDocumentIds, setAcceptedDocumentIds] = useState<Set<string>>(new Set());
  const [editingProfileId, setEditingProfileId] = useState("");
  const [profileEditForm, setProfileEditForm] = useState(emptyProfileEditForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Carregando dados reais da base...");
  const [adminActionMessage, setAdminActionMessage] = useState("");

  const loadPartnerships = async () => {
    const { data } = await supabase
      .from("partnership_promotions")
      .select("id,title,partner_name,description,promotion_label,image_url,link_url,is_active,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    setPartnerships(data || []);
  };

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from("admin_contacts")
      .select("id,name,phone,phone_normalized,sale_closed,admin_user_id,admin_name,admin_email,sale_closed_at,sale_closed_by_admin_user_id,sale_closed_by_admin_name,sale_closed_by_admin_email,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      setContactStatus(`Nao foi possivel carregar contatos: ${error.message}`);
      return;
    }

    setContacts(data || []);
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,type,name,whatsapp,location,description,active_plan,is_online,profile_verified,profile_approval_status,user_document_path,user_document_name,user_document_back_path,user_document_back_name,created_at,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage(`Não foi possível carregar perfis: ${error.message}`);
      return;
    }

    setProfiles(data || []);
    setMessage("Dados carregados da base Supabase.");
  };

  const loadProfileMedia = async () => {
    const { data, error } = await supabase
      .from("profile_media")
      .select("id,profile_id,user_id,file_name,media_type,public_url,storage_path,approval_status,is_cover,created_at,profiles(name,type,location)")
      .order("is_cover", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setMediaItems(normalizeProfileMediaRows(data || []));
    }
  };

  const loadSubscriptions = async () => {
    const { data, error } = await supabase.from("subscriptions").select("*");

    if (!error) {
      setSubscriptions(data || []);
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.push("/login");
        return;
      }

      const userEmail = user.email.toLowerCase();
      const adminName =
        String(user.user_metadata?.full_name || user.user_metadata?.name || "").trim() ||
        userEmail;
      let isAdmin = ADMIN_EMAILS.includes(userEmail);

      const [roleResult, legacyAdminResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
        supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
      ]);

      if (roleResult.data?.role === "admin" || legacyAdminResult.data) {
        isAdmin = true;
      }

      if (!isAdmin) {
        router.push("/dashboard");
        return;
      }

      setCurrentAdmin({ id: user.id, name: adminName, email: user.email || null });

      const [profilesResult, subscriptionsResult, mediaResult, contactsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,type,name,whatsapp,location,description,active_plan,is_online,profile_verified,profile_approval_status,user_document_path,user_document_name,user_document_back_path,user_document_back_name,created_at,updated_at")
          .order("updated_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase
          .from("profile_media")
          .select("id,profile_id,user_id,file_name,media_type,public_url,storage_path,approval_status,is_cover,created_at,profiles(name,type,location)")
          .order("is_cover", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("admin_contacts")
          .select("id,name,phone,phone_normalized,sale_closed,admin_user_id,admin_name,admin_email,sale_closed_at,sale_closed_by_admin_user_id,sale_closed_by_admin_name,sale_closed_by_admin_email,created_at,updated_at")
          .order("created_at", { ascending: false }),
      ]);

      if (profilesResult.error) {
        setMessage(`Não foi possível carregar perfis: ${profilesResult.error.message}`);
      } else {
        setProfiles(profilesResult.data || []);
        setMessage("Dados carregados da base Supabase.");
      }

      if (!subscriptionsResult.error) {
        setSubscriptions(subscriptionsResult.data || []);
      }

      if (!mediaResult.error) {
        setMediaItems(normalizeProfileMediaRows(mediaResult.data || []));
      }

      if (contactsResult.error) {
        setContactStatus(`Nao foi possivel carregar contatos: ${contactsResult.error.message}`);
      } else {
        setContacts(contactsResult.data || []);
      }

      await loadPartnerships();
      setLoading(false);
    };

    loadAdminData();
  }, [router]);

  const planCounts = useMemo(() => {
    return profiles.reduce<Record<string, number>>((acc, profile) => {
      const plan = getPlanConfig(profile.active_plan || "Basico").displayName;
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});
  }, [profiles]);

  const activeProfiles = profiles.filter((profile) => profile.is_online || profile.profile_verified).length;
  const manageableProfiles = useMemo(() => {
    const genericNames = new Set(["modelo", "nova modelo", "perfil sem nome"]);

    return profiles.filter((profile) => {
      const status = profile.profile_approval_status;
      const name = profile.name?.trim().toLowerCase() || "";

      return Boolean(name) && !genericNames.has(name) && (status === "approved" || status === "pending");
    });
  }, [profiles]);
  const profilePageCount = Math.max(1, Math.ceil(manageableProfiles.length / PROFILES_PER_PAGE));
  const visibleManageableProfiles = manageableProfiles.slice(
    (profilePage - 1) * PROFILES_PER_PAGE,
    profilePage * PROFILES_PER_PAGE,
  );
  const documentProfiles = useMemo(() => {
    const normalizedSearch = documentSearch.trim().toLowerCase();

    return allProfileDocuments(profiles).filter((profile) => {
      if (!normalizedSearch) return true;

      return (profile.name || "").toLowerCase().includes(normalizedSearch);
    });
  }, [documentSearch, profiles]);
  const documentPageCount = Math.max(1, Math.ceil(documentProfiles.length / DOCUMENTS_PER_PAGE));
  const visibleDocumentProfiles = documentProfiles.slice(
    (documentPage - 1) * DOCUMENTS_PER_PAGE,
    documentPage * DOCUMENTS_PER_PAGE,
  );
  const subscriptionPageCount = Math.max(1, Math.ceil(subscriptions.length / SUBSCRIPTIONS_PER_PAGE));
  const visibleSubscriptions = subscriptions.slice(
    (subscriptionPage - 1) * SUBSCRIPTIONS_PER_PAGE,
    subscriptionPage * SUBSCRIPTIONS_PER_PAGE,
  );
  const closedContacts = contacts.filter((contact) => contact.sale_closed).length;
  const contactCloseRate = contacts.length ? Math.round((closedContacts / contacts.length) * 100) : 0;
  const contactCloserStats = useMemo(() => {
    return contacts
      .filter((contact) => contact.sale_closed)
      .reduce<Record<string, number>>((acc, contact) => {
        const adminName = contact.sale_closed_by_admin_name || contact.admin_name || "Administrador";
        acc[adminName] = (acc[adminName] || 0) + 1;
        return acc;
      }, {});
  }, [contacts]);
  const topContactCloser = Object.entries(contactCloserStats).sort((a, b) => b[1] - a[1])[0] || null;
  const contactPageCount = Math.max(1, Math.ceil(contacts.length / CONTACTS_PER_PAGE));
  const visibleContacts = contacts.slice(
    (contactPage - 1) * CONTACTS_PER_PAGE,
    contactPage * CONTACTS_PER_PAGE,
  );
  const getProfileSubscription = (profileId: string) => {
    return subscriptions.find((subscription) => subscription.profile_id === profileId || subscription.user_id === profileId) || null;
  };

  useEffect(() => {
    if (documentPage > documentPageCount) {
      setDocumentPage(documentPageCount);
    }
  }, [documentPage, documentPageCount]);

  useEffect(() => {
    if (profilePage > profilePageCount) {
      setProfilePage(profilePageCount);
    }
  }, [profilePage, profilePageCount]);

  useEffect(() => {
    if (subscriptionPage > subscriptionPageCount) {
      setSubscriptionPage(subscriptionPageCount);
    }
  }, [subscriptionPage, subscriptionPageCount]);

  useEffect(() => {
    if (contactPage > contactPageCount) {
      setContactPage(contactPageCount);
    }
  }, [contactPage, contactPageCount]);

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = contactForm.name.trim();
    const phone = contactForm.phone.trim();
    const normalizedPhone = normalizePhone(phone);

    if (!name || !phone) {
      setContactStatus("Informe nome e telefone do contato.");
      return;
    }

    if (!normalizedPhone) {
      setContactStatus("Informe um telefone valido.");
      return;
    }

    const existingContact = contacts.find((contact) => {
      const existingPhone = contact.phone_normalized || normalizePhone(contact.phone);
      return existingPhone === normalizedPhone;
    });

    if (existingContact) {
      setContactStatus(`Este telefone ja foi adicionado para ${existingContact.name}.`);
      return;
    }

    setContactStatus("Salvando contato...");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const adminEmail = user?.email || currentAdmin?.email || null;
    const adminName =
      String(user?.user_metadata?.full_name || user?.user_metadata?.name || "").trim() ||
      currentAdmin?.name ||
      adminEmail ||
      "Administrador";

    const { error } = await supabase.from("admin_contacts").insert({
      name,
      phone,
      phone_normalized: normalizedPhone,
      sale_closed: contactForm.sale_closed,
      admin_user_id: user?.id || currentAdmin?.id || null,
      admin_name: adminName,
      admin_email: adminEmail,
      sale_closed_at: contactForm.sale_closed ? new Date().toISOString() : null,
      sale_closed_by_admin_user_id: contactForm.sale_closed ? user?.id || currentAdmin?.id || null : null,
      sale_closed_by_admin_name: contactForm.sale_closed ? adminName : null,
      sale_closed_by_admin_email: contactForm.sale_closed ? adminEmail : null,
    });

    if (error) {
      if (error.code === "23505") {
        setContactStatus("Este telefone ja foi adicionado anteriormente.");
        return;
      }

      setContactStatus(`Erro ao salvar contato: ${error.message}`);
      return;
    }

    setContactForm(emptyContactForm);
    setContactPage(1);
    setContactStatus("Contato registrado com sucesso.");
    await loadContacts();
  };

  const toggleContactSale = async (contact: AdminContact) => {
    setContactStatus("Atualizando contato...");

    const closingSale = !contact.sale_closed;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const adminEmail = user?.email || currentAdmin?.email || null;
    const adminName =
      String(user?.user_metadata?.full_name || user?.user_metadata?.name || "").trim() ||
      currentAdmin?.name ||
      adminEmail ||
      "Administrador";

    const { error } = await supabase
      .from("admin_contacts")
      .update({
        sale_closed: closingSale,
        sale_closed_at: closingSale ? new Date().toISOString() : null,
        sale_closed_by_admin_user_id: closingSale ? user?.id || currentAdmin?.id || null : null,
        sale_closed_by_admin_name: closingSale ? adminName : null,
        sale_closed_by_admin_email: closingSale ? adminEmail : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contact.id);

    if (error) {
      setContactStatus(`Erro ao atualizar contato: ${error.message}`);
      return;
    }

    setContactStatus(closingSale ? "Venda marcada como fechada." : "Venda marcada como nao fechada.");
    await loadContacts();
  };

  const handlePartnershipSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPartnershipStatus("Salvando parceria...");

    const { error } = await supabase.from("partnership_promotions").insert({
      title: partnershipForm.title.trim(),
      partner_name: partnershipForm.partner_name.trim(),
      description: partnershipForm.description.trim(),
      promotion_label: partnershipForm.promotion_label.trim() || null,
      image_url: partnershipForm.image_url.trim(),
      link_url: partnershipForm.link_url.trim() || null,
      sort_order: Number(partnershipForm.sort_order) || 0,
      is_active: partnershipForm.is_active,
    });

    if (error) {
      setPartnershipStatus(`Erro ao salvar: ${error.message}`);
      return;
    }

    setPartnershipForm(emptyPartnershipForm);
    setPartnershipStatus("Parceria publicada com sucesso.");
    await loadPartnerships();
  };

  const deletePartnership = async (item: PartnershipPromotion) => {
    const shouldDelete = window.confirm(`Apagar a parceria "${item.title}"? Esta acao nao pode ser desfeita.`);

    if (!shouldDelete) {
      return;
    }

    setPartnershipStatus("Apagando parceria...");

    const { error } = await supabase
      .from("partnership_promotions")
      .delete()
      .eq("id", item.id);

    if (error) {
      setPartnershipStatus(`Erro ao apagar: ${error.message}`);
      return;
    }

    setPartnershipStatus("Parceria apagada com sucesso.");
    await loadPartnerships();
  };

  const updateProfileApproval = async (profileId: string, status: "approved" | "rejected") => {
    setAdminActionMessage("Atualizando aceite do perfil...");
    const profile = profiles.find((item) => item.id === profileId);

    if (status === "approved" && !profile?.user_document_path) {
      setAdminActionMessage("Nao e possivel aprovar: o perfil ainda nao enviou a documentacao em PDF.");
      return;
    }

    if (status === "approved" && !acceptedDocumentIds.has(profileId)) {
      setAdminActionMessage("Aceite o documento antes de aprovar o perfil.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        profile_approval_status: status,
        profile_verified: status === "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (error) {
      setAdminActionMessage(`Erro ao atualizar perfil: ${error.message}`);
      return;
    }

    setAdminActionMessage(status === "approved" ? "Perfil aprovado." : "Perfil recusado.");
    await loadProfiles();
  };

  const acceptProfileDocument = (profile: Profile) => {
    if (!profile.user_document_path) {
      setAdminActionMessage("Nao ha documento enviado para aceitar.");
      return;
    }

    setAcceptedDocumentIds((current) => {
      const next = new Set(current);
      next.add(profile.id);
      return next;
    });
    setAdminActionMessage(`Documento de ${profile.name || "perfil sem nome"} aceito. O perfil continua pendente para aprovacao final.`);
  };

  const updateProfileMediaApproval = async (mediaId: string, status: "approved" | "rejected") => {
    setAdminActionMessage("Atualizando aceite da foto...");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profile_media")
      .update({
        approval_status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mediaId);

    if (error) {
      setAdminActionMessage(`Erro ao atualizar foto: ${error.message}`);
      return;
    }

    setAdminActionMessage(status === "approved" ? "Foto aprovada." : "Foto recusada.");
    await loadProfileMedia();
  };

  const startProfileEdit = (profile: Profile) => {
    const subscription = getProfileSubscription(profile.id);
    const daysLeft = getSubscriptionDaysLeft(subscription);

    setEditingProfileId(profile.id);
    setProfileEditForm({
      name: profile.name || "",
      type: profile.type || "mulher",
      whatsapp: profile.whatsapp || "",
      location: profile.location || "",
      active_plan: profile.active_plan || "Basico",
      plan_days: daysLeft && daysLeft > 0 ? String(daysLeft) : "30",
      is_online: Boolean(profile.is_online),
      profile_approval_status: profile.profile_approval_status === "approved" ? "approved" : "pending",
      new_password: "",
    });
  };

  const cancelProfileEdit = () => {
    setEditingProfileId("");
    setProfileEditForm(emptyProfileEditForm);
  };

  const saveProfileEdit = async () => {
    if (!editingProfileId) return;

    setAdminActionMessage("Salvando perfil...");
    const profile = profiles.find((item) => item.id === editingProfileId);

    if (profileEditForm.profile_approval_status === "approved" && !profile?.user_document_path) {
      setAdminActionMessage("Nao e possivel aprovar: o perfil ainda nao enviou a documentacao em PDF.");
      return;
    }

    const selectedPlan = getPlanConfig(profileEditForm.active_plan);
    const planDays = Math.max(1, Math.floor(Number(profileEditForm.plan_days) || 0));
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + planDays);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profileEditForm.name.trim() || null,
        type: profileEditForm.type,
        whatsapp: profileEditForm.whatsapp.trim() || null,
        location: profileEditForm.location.trim() || null,
        active_plan: profileEditForm.active_plan,
        is_online: profileEditForm.is_online,
        profile_approval_status: profileEditForm.profile_approval_status,
        profile_verified: profileEditForm.profile_approval_status === "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingProfileId);

    if (error) {
      setAdminActionMessage(`Erro ao salvar perfil: ${error.message}`);
      return;
    }

    if (profileEditForm.new_password) {
      const { error: passwordError } = await supabase.rpc('admin_update_user_password', {
        target_user_id: editingProfileId,
        new_password: profileEditForm.new_password
      });

      if (passwordError) {
        setAdminActionMessage(`Perfil salvo, mas erro ao atualizar senha: ${passwordError.message}`);
        await loadProfiles();
        return;
      }
    }

    const subscriptionPayload = {
      user_id: editingProfileId,
      profile_id: editingProfileId,
      plan: selectedPlan.key,
      plan_key: selectedPlan.key,
      amount: getPlanAmount(selectedPlan.price),
      payment_method: "manual_admin",
      status: "active",
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
    };
    const existingSubscription = getProfileSubscription(editingProfileId);
    const subscriptionResult = existingSubscription?.id
      ? await supabase.from("subscriptions").update(subscriptionPayload).eq("id", existingSubscription.id)
      : existingSubscription
        ? await supabase
            .from("subscriptions")
            .update(subscriptionPayload)
            .or(`user_id.eq.${editingProfileId},profile_id.eq.${editingProfileId}`)
        : await supabase.from("subscriptions").insert(subscriptionPayload);

    if (subscriptionResult.error) {
      setAdminActionMessage(`Perfil salvo, mas houve erro ao atualizar o plano: ${subscriptionResult.error.message}`);
      await loadProfiles();
      return;
    }

    setAdminActionMessage("Perfil atualizado.");
    cancelProfileEdit();
    await Promise.all([loadProfiles(), loadSubscriptions()]);
  };

  const deleteProfile = async (profile: Profile) => {
    const confirmed = window.confirm(`Excluir o perfil de ${profile.name || "sem nome"}? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setAdminActionMessage("Excluindo perfil...");

    await supabase.from("profile_media").delete().eq("profile_id", profile.id);
    const { error } = await supabase.from("profiles").delete().eq("id", profile.id);

    if (error) {
      setAdminActionMessage(`Erro ao excluir perfil: ${error.message}`);
      return;
    }

    if (editingProfileId === profile.id) {
      cancelProfileEdit();
    }

    setAdminActionMessage("Perfil excluído.");
    await Promise.all([loadProfiles(), loadProfileMedia()]);
  };

  const viewUserDocument = async (path: string | null) => {
    if (!path) return;

    const { data, error } = await supabase.storage.from("user-documents").createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      setAdminActionMessage(`Não foi possível abrir o documento: ${error?.message || "URL indisponível"}`);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("hasActivePlan");
    sessionStorage.removeItem("hasActivePlan");
    router.push("/login");
  };

  return (
    <div className="entry-page" style={{ overflowX: "hidden" }}>
      <header className="app-header" style={{ borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
        <Link className="brand" href="/">
          <span className="brand__mark" style={{ background: "var(--gold-primary)", color: "#111" }}>ADM</span>
          <span>Painel Administrativo</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação administrativa">
          <Link href="/">Site</Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              minHeight: "2.5rem",
              display: "inline-flex",
              alignItems: "center",
              padding: "0.5rem 0.82rem",
              border: "1px solid transparent",
              borderRadius: "999px",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Sair
          </button>
        </nav>
      </header>

      <main className="app-page dashboard admin-dashboard-page" style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        <div className="admin-dashboard-heading" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Gestão Geral da Plataforma</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>{message}</p>
        </div>

        <div className="admin-dashboard-tabs" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(245, 230, 200, 0.1)", paddingBottom: "1rem", overflowX: "auto" }}>
          {[
            { id: "aprovacoes", label: "Aprovações" },
            { id: "documentos", label: "Documentação" },
            { id: "perfis", label: "Gerenciar Perfis" },
            { id: "financeiro", label: "Visão Financeira" },
            { id: "contatos", label: "Contatos" },
            { id: "parcerias", label: "Parcerias e Promoções" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "rgba(212, 175, 55, 0.1)" : "transparent",
                border: "none",
                color: activeTab === tab.id ? "var(--gold-primary)" : "var(--text-secondary)",
                padding: "0.8rem 1.5rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-dashboard-panel" style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(245, 230, 200, 0.08)", borderRadius: "1.25rem", padding: "clamp(1.25rem, 4vw, 2.5rem)", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", overflowX: "auto" }}>
          {loading && <p style={{ color: "var(--text-secondary)" }}>Carregando...</p>}

          {!loading && activeTab === "aprovacoes" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Fila de Aceite</h2>
                <span style={{ padding: "0.4rem 1rem", background: "rgba(234,179,8,0.1)", color: "#eab308", borderRadius: "999px", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {profiles.filter((profile) => profile.profile_approval_status === "pending").length + mediaItems.filter((item) => item.approval_status === "pending").length} pendente(s)
                </span>
              </div>
              {adminActionMessage && <p style={{ color: "var(--text-secondary)" }}>{adminActionMessage}</p>}

              <div style={{ display: "grid", gap: "1.5rem" }}>
                <section>
                  <h3 style={{ color: "var(--gold-primary)", marginBottom: "0.35rem" }}>1. Seção para aceitar foto</h3>
                  <p style={{ color: "var(--text-secondary)", margin: "0 0 1rem" }}>Aprova ou recusa as fotos e vídeos enviados pelos perfis.</p>
                  {mediaItems.filter((item) => item.approval_status === "pending").length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Nenhuma mídia aguardando aceite.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "0.85rem" }}>
                      {mediaItems.filter((item) => item.approval_status === "pending").map((item) => (
                        <article className="admin-list-item admin-list-item--media" key={item.id} style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr auto", gap: "1rem", alignItems: "center", padding: "0.85rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                          <div className="watermarked-media watermarked-media--admin-thumb">
                            {item.media_type === "video" && item.public_url ? (
                              <video src={item.public_url} muted />
                            ) : item.public_url ? (
                              <img src={item.public_url} alt={item.file_name || "Foto enviada"} />
                            ) : (
                              <div />
                            )}
                          </div>
                          <div>
                            <strong style={{ color: "white" }}>{item.profiles?.name || "Perfil sem nome"}</strong>
                            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                              {item.profiles?.type || "Categoria nao informada"} - {item.profiles?.location || "Localizacao nao informada"}
                            </p>
                            {item.is_cover && (
                              <span style={{ display: "inline-flex", width: "fit-content", marginTop: "0.35rem", padding: "0.25rem 0.55rem", borderRadius: "999px", background: "rgba(212,175,55,0.14)", color: "var(--gold-primary)", fontWeight: 900, fontSize: "0.75rem" }}>
                                Foto de capa
                              </span>
                            )}
                            <p style={{ color: "var(--text-secondary)", margin: "0.2rem 0 0", fontSize: "0.85rem" }}>{item.file_name || (item.media_type === "video" ? "Vídeo enviado" : "Foto enviada")}</p>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {item.public_url && (
                              <a className="button button--ghost" href={item.public_url} target="_blank" rel="noreferrer">
                                Visualizar
                              </a>
                            )}
                            <button className="button button--primary" type="button" onClick={() => updateProfileMediaApproval(item.id, "approved")}>
                              Aprovar
                            </button>
                            <button className="button button--ghost" type="button" onClick={() => updateProfileMediaApproval(item.id, "rejected")}>
                              Recusar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 style={{ color: "var(--gold-primary)", marginBottom: "0.35rem" }}>2. Seção para aceitar documento</h3>
                  <p style={{ color: "var(--text-secondary)", margin: "0 0 1rem" }}>Aceitar o documento não aprova o perfil; apenas libera o perfil para a etapa de aprovação.</p>
                  {pendingProfileDocuments(profiles).length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Nenhum documento aguardando aceite.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "0.85rem" }}>
                      {pendingProfileDocuments(profiles).map((profile) => (
                        <article className="admin-list-item" key={profile.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", padding: "0.85rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                          <div>
                            <strong style={{ color: "white" }}>{profile.name || "Perfil sem nome"}</strong>
                            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                              {profile.user_document_name || "Documento PDF enviado"}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button className="button button--ghost" type="button" onClick={() => viewUserDocument(profile.user_document_path)}>
                              Visualizar
                            </button>
                            <button className="button button--primary" type="button" onClick={() => acceptProfileDocument(profile)}>
                              {acceptedDocumentIds.has(profile.id) ? "Documento aceito" : "Aceitar documento"}
                            </button>
                            <button className="button button--ghost" type="button" onClick={() => updateProfileApproval(profile.id, "rejected")}>
                              Recusar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h3 style={{ color: "var(--gold-primary)", marginBottom: "0.35rem" }}>3. Seção de aprovar perfil</h3>
                  <p style={{ color: "var(--text-secondary)", margin: "0 0 1rem" }}>O perfil só pode ser aprovado depois que o documento estiver ok.</p>
                  {profiles.filter((profile) => profile.profile_approval_status === "pending").length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Nenhum perfil aguardando aceite.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {profiles.filter((profile) => profile.profile_approval_status === "pending").map((profile) => (
                    <article className="admin-list-item" key={profile.id} style={{ display: "grid", gap: "0.85rem", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <strong style={{ color: "white" }}>{profile.name || "Perfil sem nome"}</strong>
                          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                            {profile.type || "Categoria nao informada"} - {profile.location || "Localizacao nao informada"}
                          </p>
                        </div>
                        <span style={{ color: profile.is_online ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                          {profile.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                      {profile.description && <p style={{ color: "var(--text-secondary)", margin: 0 }}>{profile.description}</p>}
                      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        <span style={{ padding: "0.35rem 0.7rem", borderRadius: "999px", background: profile.user_document_path ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", color: profile.user_document_path ? "#4ade80" : "#f87171", fontWeight: 800, fontSize: "0.85rem" }}>
                          {acceptedDocumentIds.has(profile.id) ? "Documento ok" : profile.user_document_path ? "Documento enviado" : "Sem documento"}
                        </span>
                        {profile.user_document_name && (
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{profile.user_document_name}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {profile.user_document_path && (
                          <button className="button button--ghost" type="button" onClick={() => viewUserDocument(profile.user_document_path)}>
                            Ver PDF
                          </button>
                        )}
                        <button
                          className="button button--primary"
                          type="button"
                          disabled={!acceptedDocumentIds.has(profile.id)}
                          title={!profile.user_document_path ? "Envio de documentacao obrigatorio para aprovar" : !acceptedDocumentIds.has(profile.id) ? "Aceite o documento antes de aprovar" : undefined}
                          onClick={() => updateProfileApproval(profile.id, "approved")}
                        >
                          Aprovar
                        </button>
                        <button className="button button--ghost" type="button" onClick={() => updateProfileApproval(profile.id, "rejected")}>
                          Recusar
                        </button>
                      </div>
                    </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {!loading && activeTab === "documentos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Documentação dos cadastrados</h2>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {documentProfiles.length} documento(s) encontrado(s)
                </span>
              </div>
              {adminActionMessage && <p style={{ color: "var(--text-secondary)" }}>{adminActionMessage}</p>}

              <label className="input-group" style={{ maxWidth: "420px", marginBottom: "1rem" }}>
                <span>Pesquisar por nome</span>
                <input
                  type="search"
                  value={documentSearch}
                  onChange={(event) => {
                    setDocumentSearch(event.target.value);
                    setDocumentPage(1);
                  }}
                  placeholder="Digite o nome da modelo"
                  style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}
                />
              </label>

              {documentProfiles.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhuma modelo com documento encontrada.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {visibleDocumentProfiles.map((profile) => (
                    <article className="admin-list-item" key={profile.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "1rem", alignItems: "center", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: "white" }}>{profile.name || "Perfil sem nome"}</strong>
                        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                          {profile.type || "Categoria nao informada"} - {profile.location || "Localizacao nao informada"}
                        </p>
                        {profile.user_document_path && (
                          <p style={{ color: "#4ade80", margin: "0.35rem 0 0", fontWeight: 800 }}>
                            Frente: {profile.user_document_name || "Documento enviado"}
                          </p>
                        )}
                        {profile.user_document_back_path && (
                          <p style={{ color: "#4ade80", margin: "0.35rem 0 0", fontWeight: 800 }}>
                            Verso: {profile.user_document_back_name || "Documento enviado"}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {profile.user_document_path && (
                          <button
                            className="button button--ghost"
                            type="button"
                            onClick={() => viewUserDocument(profile.user_document_path)}
                          >
                            Ver Frente
                          </button>
                        )}
                        {profile.user_document_back_path && (
                          <button
                            className="button button--ghost"
                            type="button"
                            onClick={() => viewUserDocument(profile.user_document_back_path)}
                          >
                            Ver Verso
                          </button>
                        )}
                      </div>
                    </article>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Página {documentPage} de {documentPageCount}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button
                        className="button button--ghost"
                        type="button"
                        disabled={documentPage <= 1}
                        onClick={() => setDocumentPage((page) => Math.max(1, page - 1))}
                      >
                        Anterior
                      </button>
                      <button
                        className="button button--ghost"
                        type="button"
                        disabled={documentPage >= documentPageCount}
                        onClick={() => setDocumentPage((page) => Math.min(documentPageCount, page + 1))}
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "perfis" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Gerenciar Perfis</h2>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{manageableProfiles.length} perfil(is) aprovado(s) ou aguardando aprovação</span>
              </div>

              {adminActionMessage && <p style={{ color: "var(--text-secondary)" }}>{adminActionMessage}</p>}

              {manageableProfiles.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhum perfil encontrado.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {visibleManageableProfiles.map((profile) => (
                    <article key={profile.id} style={{ display: "grid", gap: "0.85rem", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      {(() => {
                        const subscription = getProfileSubscription(profile.id);
                        const daysLeft = getSubscriptionDaysLeft(subscription);
                        const endDate = getSubscriptionEndDate(subscription);

                        return (
                      <div className="admin-profile-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(8rem, 0.7fr) minmax(8rem, 0.7fr) minmax(10rem, auto)", gap: "1rem", alignItems: "center" }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: "white" }}>{profile.name}</strong>
                          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>{profile.location || "Localização não informada"}</p>
                        </div>
                        <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{profile.type || "Não informado"}</span>
                        <span style={{ color: "white" }}>
                          {getPlanConfig(profile.active_plan || "Basico").displayName}
                          <small style={{ display: "block", marginTop: "0.2rem", color: "var(--text-secondary)", fontSize: "0.76rem" }}>
                            {endDate ? `${daysLeft} dia(s) restantes` : "Sem vencimento definido"}
                          </small>
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <span style={{ width: "100%", color: profile.profile_approval_status === "approved" ? "#4ade80" : "#eab308", fontWeight: "bold", textAlign: "right" }}>
                            {profile.profile_approval_status === "approved" ? "Aprovado" : "Aguardando aprovação"}
                          </span>
                          <button className="button button--ghost" type="button" onClick={() => startProfileEdit(profile)}>Editar</button>
                          <button className="button button--ghost" type="button" onClick={() => deleteProfile(profile)}>Excluir</button>
                        </div>
                      </div>
                        );
                      })()}

                      {editingProfileId === profile.id && (
                        <div style={{ display: "grid", gap: "1rem", padding: "1rem", borderRadius: "0.65rem", background: "rgba(0,0,0,0.28)", border: "1px solid rgba(245,230,200,0.08)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                            <label className="input-group"><span>Nome</span><input value={profileEditForm.name} onChange={(event) => setProfileEditForm({ ...profileEditForm, name: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Categoria</span><select value={profileEditForm.type} onChange={(event) => setProfileEditForm({ ...profileEditForm, type: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}><option value="mulher">Mulher</option><option value="homem">Homem</option><option value="trans">Trans</option></select></label>
                            <label className="input-group"><span>WhatsApp</span><input value={profileEditForm.whatsapp} onChange={(event) => setProfileEditForm({ ...profileEditForm, whatsapp: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Localização</span><input value={profileEditForm.location} onChange={(event) => setProfileEditForm({ ...profileEditForm, location: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Plano</span><select value={profileEditForm.active_plan} onChange={(event) => setProfileEditForm({ ...profileEditForm, active_plan: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}>{PLAN_LIST.map((plan) => <option key={plan.key} value={plan.key}>{plan.displayName}</option>)}</select></label>
                            <label className="input-group"><span>Dias do plano</span><input type="number" min="1" max="365" value={profileEditForm.plan_days} onChange={(event) => setProfileEditForm({ ...profileEditForm, plan_days: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label className="input-group"><span>Status</span><select value={profileEditForm.profile_approval_status} onChange={(event) => setProfileEditForm({ ...profileEditForm, profile_approval_status: event.target.value as "pending" | "approved" })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}><option value="pending">Aguardando aprovação</option><option value="approved">Aprovado</option></select></label>
                            <label className="input-group"><span>Nova Senha (Opcional)</span><input type="password" placeholder="Deixe em branco para não alterar" value={profileEditForm.new_password} onChange={(event) => setProfileEditForm({ ...profileEditForm, new_password: event.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} /></label>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)" }}><input type="checkbox" checked={profileEditForm.is_online} onChange={(event) => setProfileEditForm({ ...profileEditForm, is_online: event.target.checked })} />Online</label>
                          </div>
                          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                            <button className="button button--primary" type="button" onClick={saveProfileEdit}>Salvar alterações</button>
                            <button className="button button--ghost" type="button" onClick={cancelProfileEdit}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Página {profilePage} de {profilePageCount}</span>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button className="button button--ghost" type="button" disabled={profilePage <= 1} onClick={() => setProfilePage((page) => Math.max(1, page - 1))}>Anterior</button>
                      <button className="button button--ghost" type="button" disabled={profilePage >= profilePageCount} onClick={() => setProfilePage((page) => Math.min(profilePageCount, page + 1))}>Próxima</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "financeiro" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Receita e Assinaturas</h2>

                <div className="admin-metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Perfis na base</p>
                  <strong style={{ display: "block", fontSize: "2.5rem", color: "white", margin: "0.5rem 0" }}>{profiles.length}</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{activeProfiles} com sinal ativo/verificado</span>
                </div>

                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Assinaturas</p>
                  <strong style={{ display: "block", fontSize: "2.5rem", color: "white", margin: "0.5rem 0" }}>{subscriptions.length}</strong>
                  <span style={{ color: "var(--gold-primary)", fontSize: "0.85rem" }}>
                    {Object.entries(planCounts).map(([plan, count]) => `${count} ${plan}`).join(" | ") || "Sem planos ativos"}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem" }}>Assinaturas registradas</h3>
              {subscriptions.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhuma assinatura encontrada na tabela `subscriptions`.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "680px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--gold-primary)" }}>
                      <th style={{ padding: "1rem" }}>Plano</th>
                      <th style={{ padding: "1rem" }}>Status</th>
                      <th style={{ padding: "1rem" }}>Vence em</th>
                      <th style={{ padding: "1rem" }}>Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSubscriptions.map((subscription, index) => {
                      const daysLeft = getSubscriptionDaysLeft(subscription);
                      const endDate = getSubscriptionEndDate(subscription);
                      const absoluteIndex = (subscriptionPage - 1) * SUBSCRIPTIONS_PER_PAGE + index;

                      return (
                        <tr key={subscription.id || `${subscription.user_id}-${absoluteIndex}`} style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                          <td style={{ padding: "1rem" }}>{getPlanConfig(subscription.plan || subscription.plan_key || "Basico").displayName}</td>
                          <td style={{ padding: "1rem" }}>{subscription.status || "Sem status"}</td>
                          <td style={{ padding: "1rem", color: daysLeft === 0 ? "#f87171" : "var(--text-secondary)" }}>
                            {endDate ? `${daysLeft} dia(s) - ${formatDateTimeSP(endDate.toISOString())}` : "Sem vencimento"}
                          </td>
                          <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{formatDateTimeSP(subscription.updated_at || subscription.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {subscriptions.length > SUBSCRIPTIONS_PER_PAGE && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Página {subscriptionPage} de {subscriptionPageCount}</span>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button className="button button--ghost" type="button" disabled={subscriptionPage <= 1} onClick={() => setSubscriptionPage((page) => Math.max(1, page - 1))}>Anterior</button>
                    <button className="button button--ghost" type="button" disabled={subscriptionPage >= subscriptionPageCount} onClick={() => setSubscriptionPage((page) => Math.min(subscriptionPageCount, page + 1))}>Próxima</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "contatos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Controle de Contatos</h2>
                  <p style={{ color: "var(--text-secondary)", margin: "0.35rem 0 0" }}>
                    {contacts.length} contato(s) registrado(s), {closedContacts} venda(s) fechada(s)
                  </p>
                </div>
                {currentAdmin && (
                  <span style={{ padding: "0.4rem 0.8rem", borderRadius: "999px", background: "rgba(212,175,55,0.1)", color: "var(--gold-primary)", fontWeight: 800, fontSize: "0.86rem" }}>
                    {currentAdmin.name}
                  </span>
                )}
              </div>

              <form onSubmit={handleContactSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
                <div className="admin-contact-form-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto", gap: "1rem", alignItems: "end" }}>
                  <label className="input-group">
                    <span>Nome do contato</span>
                    <input
                      required
                      value={contactForm.name}
                      onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
                      placeholder="Ex: Bianca Souza"
                      style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}
                    />
                  </label>
                  <label className="input-group">
                    <span>Telefone</span>
                    <input
                      required
                      value={contactForm.phone}
                      onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                      placeholder="(00) 00000-0000"
                      style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }}
                    />
                  </label>
                  <label style={{ minHeight: "3rem", display: "inline-flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)", fontWeight: 800 }}>
                    <input
                      type="checkbox"
                      checked={contactForm.sale_closed}
                      onChange={(event) => setContactForm({ ...contactForm, sale_closed: event.target.checked })}
                    />
                    Venda fechada
                  </label>
                </div>
                <button className="button button--primary" type="submit" style={{ justifySelf: "start", padding: "0.9rem 1.4rem" }}>
                  Adicionar contato
                </button>
                {contactStatus && <p style={{ color: "var(--text-secondary)", margin: 0 }}>{contactStatus}</p>}
              </form>

              <div className="admin-contact-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <article style={{ padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.8rem", background: "rgba(18,18,18,0.55)" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 800 }}>Contatos feitos</span>
                  <strong style={{ display: "block", marginTop: "0.35rem", color: "white", fontSize: "2rem" }}>{contacts.length}</strong>
                </article>
                <article style={{ padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.8rem", background: "rgba(18,18,18,0.55)" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 800 }}>Vendas fechadas</span>
                  <strong style={{ display: "block", marginTop: "0.35rem", color: "#4ade80", fontSize: "2rem" }}>{closedContacts}</strong>
                </article>
                <article style={{ padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.8rem", background: "rgba(18,18,18,0.55)" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 800 }}>Taxa de fechamento</span>
                  <strong style={{ display: "block", marginTop: "0.35rem", color: "white", fontSize: "2rem" }}>{contactCloseRate}%</strong>
                </article>
                <article style={{ padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.8rem", background: "rgba(18,18,18,0.55)" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 800 }}>Quem fechou mais</span>
                  <strong style={{ display: "block", marginTop: "0.35rem", color: "white", fontSize: "1rem" }}>{topContactCloser?.[0] || "Sem vendas"}</strong>
                  <span style={{ display: "block", marginTop: "0.25rem", color: "var(--gold-primary)", fontWeight: 800 }}>
                    {topContactCloser ? `${topContactCloser[1]} venda(s)` : "0 venda"}
                  </span>
                </article>
              </div>

              {Object.keys(contactCloserStats).length > 0 && (
                <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  {Object.entries(contactCloserStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([adminName, total]) => (
                      <span key={adminName} style={{ padding: "0.38rem 0.7rem", border: "1px solid rgba(74,222,128,0.22)", borderRadius: "999px", background: "rgba(74,222,128,0.08)", color: "#d8ffe2", fontWeight: 800, fontSize: "0.82rem" }}>
                        {adminName}: {total}
                      </span>
                    ))}
                </div>
              )}

              {contacts.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>Nenhum contato registrado ainda.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {visibleContacts.map((contact) => (
                    <article className="admin-list-item admin-contact-item" key={contact.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr) minmax(0, 1fr) auto", gap: "1rem", alignItems: "center", padding: "1rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.75rem", background: "rgba(18,18,18,0.55)" }}>
                      <div>
                        <strong style={{ display: "block", color: "white" }}>{contact.name}</strong>
                        <a href={`tel:${contact.phone}`} style={{ display: "inline-block", marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                          {contact.phone}
                        </a>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 800 }}>Adicionado em</span>
                        <p style={{ margin: "0.25rem 0 0", color: "white" }}>{formatDateTimeSP(contact.created_at)}</p>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 800 }}>Administrador</span>
                        <p style={{ margin: "0.25rem 0 0", color: "white" }}>{contact.admin_name}</p>
                        {contact.sale_closed && (
                          <small style={{ display: "block", marginTop: "0.25rem", color: "var(--gold-primary)", fontWeight: 800 }}>
                            Fechou: {contact.sale_closed_by_admin_name || contact.admin_name}
                          </small>
                        )}
                      </div>
                      <button
                        className={contact.sale_closed ? "button button--primary" : "button button--ghost"}
                        type="button"
                        onClick={() => toggleContactSale(contact)}
                      >
                        {contact.sale_closed ? "Venda fechada" : "Nao fechou"}
                      </button>
                    </article>
                  ))}

                  {contacts.length > CONTACTS_PER_PAGE && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Página {contactPage} de {contactPageCount}</span>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button className="button button--ghost" type="button" disabled={contactPage <= 1} onClick={() => setContactPage((page) => Math.max(1, page - 1))}>Anterior</button>
                        <button className="button button--ghost" type="button" disabled={contactPage >= contactPageCount} onClick={() => setContactPage((page) => Math.min(contactPageCount, page + 1))}>Próxima</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "parcerias" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Parcerias e Promoções</h2>
                <Link className="button button--ghost" href="/parcerias-promocoes">Ver página pública</Link>
              </div>

              <form onSubmit={handlePartnershipSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                  <label className="input-group">
                    <span>Título</span>
                    <input required value={partnershipForm.title} onChange={(e) => setPartnershipForm({ ...partnershipForm, title: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Parceiro</span>
                    <input required value={partnershipForm.partner_name} onChange={(e) => setPartnershipForm({ ...partnershipForm, partner_name: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Selo</span>
                    <input placeholder="Ex: 15% OFF" value={partnershipForm.promotion_label} onChange={(e) => setPartnershipForm({ ...partnershipForm, promotion_label: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Ordem</span>
                    <input type="number" value={partnershipForm.sort_order} onChange={(e) => setPartnershipForm({ ...partnershipForm, sort_order: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                  </label>
                </div>
                <label className="input-group">
                  <span>URL da foto</span>
                  <input required type="url" placeholder="https://..." value={partnershipForm.image_url} onChange={(e) => setPartnershipForm({ ...partnershipForm, image_url: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                </label>
                <label className="input-group">
                  <span>Link da promoção</span>
                  <input type="url" placeholder="https://..." value={partnershipForm.link_url} onChange={(e) => setPartnershipForm({ ...partnershipForm, link_url: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white" }} />
                </label>
                <label className="input-group">
                  <span>Descrição</span>
                  <textarea required rows={4} value={partnershipForm.description} onChange={(e) => setPartnershipForm({ ...partnershipForm, description: e.target.value })} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(245,230,200,0.12)", color: "white", resize: "vertical" }} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={partnershipForm.is_active} onChange={(e) => setPartnershipForm({ ...partnershipForm, is_active: e.target.checked })} />
                  Publicar agora
                </label>
                <button className="button button--primary" type="submit" style={{ justifySelf: "start", padding: "0.9rem 1.4rem" }}>Cadastrar parceria</button>
                {partnershipStatus && <p style={{ color: "var(--text-secondary)", margin: 0 }}>{partnershipStatus}</p>}
              </form>

              <div style={{ display: "grid", gap: "0.85rem" }}>
                {partnerships.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>Nenhuma parceria cadastrada.</p>
                ) : partnerships.map((item) => (
                  <div className="admin-list-item admin-list-item--media" key={item.id} style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr auto", gap: "1rem", alignItems: "center", padding: "0.85rem", border: "1px solid rgba(245,230,200,0.1)", borderRadius: "0.5rem", background: "rgba(18,18,18,0.5)" }}>
                    <img src={item.image_url} alt="" style={{ width: "4.5rem", height: "4.5rem", objectFit: "contain", borderRadius: "0.35rem", background: "#080808" }} />
                    <div>
                      <strong style={{ color: "white" }}>{item.title}</strong>
                      <p style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)" }}>{item.partner_name} - {item.is_active ? "Ativa" : "Inativa"}</p>
                    </div>
                    <button className="button button--ghost" type="button" onClick={() => deletePartnership(item)}>
                      Apagar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
