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

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [creating, setCreating] = useState(false);

    const [selectedOrg, setSelectedOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await createOrganization(newOrgName, "PUBLIC"); // Automatically pass PUBLIC since visibility is removed
            const createdOrg = res.data?.data || res.data;

            setNewOrgName("");
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
        try {
            const res = await api.get(`/organizations/${orgId}/members`);
            setMembers(res.data || []);
            setSelectedOrg(orgId);
        } catch (err) {
             // global handles error
        } finally {
            setLoadingMembers(false);
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
                                    </div>
                                )}
                            </div>

                            {!selectedOrg ? (
                                <p className="text-gray-500 text-sm">Select an organization to view members</p>
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
