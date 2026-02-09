import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { getMyOrganizations, createOrganization } from "../api/organizations";
import api from "../api/axios";

export default function Organizations() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [creating, setCreating] = useState(false);

    const [selectedOrg, setSelectedOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            const res = await getMyOrganizations();
            setOrganizations(res.data?.data || res.data || []);
        } catch (err) {
            setError("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError("");

        try {
            const res = await createOrganization(newOrgName);
            // res.data is expected to be { success: true, data: { id, name } }
            const createdOrg = res.data?.data || res.data;

            setNewOrgName("");
            setShowCreateModal(false);

            // Set newly created org as active
            if (createdOrg?.id) {
                localStorage.setItem("activeOrgId", createdOrg.id);
            }

            await loadOrganizations();
            window.location.reload(); // Refresh to update switcher and context
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create organization");
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
        try {
            const res = await api.get(`/organizations/${orgId}/members`);
            setMembers(res.data || []);
            setSelectedOrg(orgId);
        } catch (err) {
            setError("Failed to load members");
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        setInviting(true);
        setError("");

        try {
            await api.post(`/organizations/${selectedOrg}/invite`, {
                email: inviteEmail,
                role: inviteRole,
            });
            setInviteEmail("");
            setInviteRole("MEMBER");
            setShowInviteModal(false);
            await loadMembers(selectedOrg);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to invite member");
        } finally {
            setInviting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
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

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500">Loading organizations...</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Organizations</h2>
                            {organizations.length === 0 ? (
                                <p className="text-gray-500 text-sm">No organizations yet. Create one to get started.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {organizations.map((org) => (
                                        <li
                                            key={org.id}
                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                                            onClick={() => loadMembers(org.id)}
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{org.name}</p>
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

                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                                {selectedOrg && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                    >
                                        + Invite
                                    </button>
                                )}
                            </div>

                            {!selectedOrg ? (
                                <p className="text-gray-500 text-sm">Select an organization to view members</p>
                            ) : loadingMembers ? (
                                <p className="text-gray-500 text-sm">Loading members...</p>
                            ) : members.length === 0 ? (
                                <p className="text-gray-500 text-sm">No members found</p>
                            ) : (
                                <ul className="space-y-2">
                                    {members.map((member) => (
                                        <li key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
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
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Organization</h3>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter organization name"
                                    />
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
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
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
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {inviting ? "Inviting..." : "Send Invite"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
