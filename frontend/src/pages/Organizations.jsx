import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getMyOrganizations, createOrganization, generateInviteCode } from "../api/organizations";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";

import { useToast } from "../context/ToastContext";

export default function Organizations() {
    const toast = useToast();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed local error state for page-level errors as we rely on Toasts, 
    // but for page load failure, a toast might disappear. 
    // However, requirements say "Replace... with toast". I will use Toast.

    // ... states ...
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgVisibility, setNewOrgVisibility] = useState("PUBLIC");
    const [creating, setCreating] = useState(false);

    const [selectedOrg, setSelectedOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberAccessDenied, setMemberAccessDenied] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [inviting, setInviting] = useState(false);

    const [showCodeModal, setShowCodeModal] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [codeExpiry, setCodeExpiry] = useState(null);
    const [generatingCode, setGeneratingCode] = useState(false);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            const res = await getMyOrganizations();
            setOrganizations(res.data?.data || res.data || []);
        } catch (err) {
            // Global interceptor handles errors. 
            // If 404 is not handled globally, we could add it here, 
            // but for now let's assume global or fallback handles it.
            // If global doesn't handle 404 (we didn't add it), it emits "Unexpected error" or "message from backend".
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await createOrganization(newOrgName, newOrgVisibility);
            const createdOrg = res.data?.data || res.data;

            setNewOrgName("");
            setNewOrgVisibility("PUBLIC");
            setShowCreateModal(false);

            if (createdOrg?.id) {
                localStorage.setItem("activeOrgId", createdOrg.id);
            }

            toast.success("Organization created successfully");
            await loadOrganizations();
            window.location.reload();
        } catch (err) {
            // Global handled
        } finally {
            setCreating(false);
        }
    };

    const handleSetActiveOrg = (orgId) => {
        localStorage.setItem("activeOrgId", orgId);
        window.location.reload();
    };

    const loadMembers = async (orgId) => {
        setLoadingMembers(true);
        setMemberAccessDenied(false);
        try {
            const res = await api.get(`/organizations/${orgId}/members`);
            setMembers(res.data || []);
            setSelectedOrg(orgId);
        } catch (err) {
            if (err.response?.status === 403) {
                setMemberAccessDenied(true);
                // 403 global toast will show "Access denied". 
                // We also want to show the specific UI state for access denied.
            }
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        setInviting(true);

        try {
            await api.post(`/organizations/${selectedOrg}/invite`, {
                email: inviteEmail,
                role: inviteRole,
            });
            setInviteEmail("");
            setInviteRole("MEMBER");
            setShowInviteModal(false);
            toast.success("Member invited successfully");
            await loadMembers(selectedOrg);
        } catch (err) {
            // Global handled
        } finally {
            setInviting(false);
        }
    };

    const handleGenerateInviteCode = async () => {
        if (!selectedOrg) return;
        setGeneratingCode(true);
        try {
            const res = await generateInviteCode(selectedOrg);
            setGeneratedCode(res.data.inviteCode);
            setCodeExpiry(res.data.expiresAt);
            setShowCodeModal(true);
        } catch (err) {
            // Global handled
        } finally {
            setGeneratingCode(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            toast.success("Invite code copied to clipboard!");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organizations</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Manage your organizations and team members
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        + Create Organization
                    </button>
                </div>



                {loading ? (
                    <LoadingSpinner message="Loading organizations..." />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Organizations</h2>
                            {organizations.length === 0 ? (
                                <p className="text-gray-500 text-sm">No organizations yet. Create one to get started.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {organizations.map((org) => (
                                        <li
                                            key={org.id}
                                            className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                            onClick={() => loadMembers(org.id)}
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {org.name}
                                                    <span className={`px-2 py-0.5 text-xs rounded ${org.visibility === "PRIVATE"
                                                        ? "bg-orange-100 text-orange-800"
                                                        : "bg-green-100 text-green-800"
                                                        }`}>
                                                        {org.visibility || "PUBLIC"}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500">Role: {org.userRole}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded ${org.id === localStorage.getItem("activeOrgId") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                    {org.id === localStorage.getItem("activeOrgId") ? "Active" : "Joined"}
                                                </span>
                                                {org.id !== localStorage.getItem("activeOrgId") && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetActiveOrg(org.id);
                                                        }}
                                                        className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                                    >
                                                        Set Active
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Members</h2>
                                {selectedOrg && (
                                    <div className="flex gap-2">
                                        {/* Check if current user is OWNER or ADMIN for this org */}
                                        {(() => {
                                            const org = organizations.find(o => o.id === selectedOrg);
                                            if (org && ["OWNER", "ADMIN"].includes(org.userRole)) {
                                                return (
                                                    <button
                                                        onClick={handleGenerateInviteCode}
                                                        disabled={generatingCode}
                                                        className="px-3 py-1 text-sm text-purple-600 border border-purple-600 rounded hover:bg-purple-50 disabled:opacity-50"
                                                    >
                                                        {generatingCode ? "Generating..." : "Generate Code"}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                        >
                                            + Invite
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!selectedOrg ? (
                                <p className="text-gray-500 text-sm">Select an organization to view members</p>
                            ) : memberAccessDenied ? (
                                <div className="text-sm text-orange-700 bg-orange-50 p-4 rounded-md">
                                    🔒 Members are hidden in private organization
                                </div>
                            ) : loadingMembers ? (
                                <div className="py-8">
                                    <LoadingSpinner message="Loading members..." />
                                </div>
                            ) : members.length === 0 ? (
                                <p className="text-gray-500 text-sm">No members found</p>
                            ) : (
                                <ul className="space-y-2">
                                    {members.map((member) => (
                                        <li key={member.id} className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-md">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                {member.role}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Create Organization Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Organization</h3>
                            <form onSubmit={handleCreateOrg}>
                                <div className="mb-4">
                                    <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        id="orgName"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter organization name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="orgVisibility" className="block text-sm font-medium text-gray-700 mb-1">
                                        Visibility
                                    </label>
                                    <select
                                        id="orgVisibility"
                                        value={newOrgVisibility}
                                        onChange={(e) => setNewOrgVisibility(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="PUBLIC">Public - Anyone can view members</option>
                                        <option value="PRIVATE">Private - Only members can view</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {creating && (
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {creating ? "Creating..." : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Invite Member Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Member</h3>
                            <form onSubmit={handleInviteMember}>
                                <div className="mb-4">
                                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="inviteEmail"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        id="inviteRole"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="AUDITOR">Auditor</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {inviting && (
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {inviting ? "Inviting..." : "Send Invite"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Invite Code Modal */}
                <Modal
                    isOpen={showCodeModal}
                    onClose={() => setShowCodeModal(false)}
                    title="Organization Invite Code"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Share this code with others to let them join this organization as a member.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-md border text-center">
                            <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                                {generatedCode}
                            </p>
                        </div>
                        <p className="text-xs text-red-500 text-center">
                            Expires on: {codeExpiry && new Date(codeExpiry).toLocaleDateString()}
                        </p>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setShowCodeModal(false)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                Close
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </AdminLayout >
    );
}
