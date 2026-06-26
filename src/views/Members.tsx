import { useState, useMemo, useCallback } from "react";
import { useStore } from "../lib/store";
import { useToast } from "../hooks/useToast";
import { applySort, paginate } from "../lib/utils";
import type { Member, ViewState } from "../types";
import Pagination from "../components/Pagination";
import SortableTh from "../components/SortableTh";
import SearchBox from "../components/SearchBox";
import { BtnPrimary, BtnGhost, BtnDanger, BtnIcon, BtnIconDanger } from "../components/UI";
import Modal from "../components/Modal";

const AVATAR_COLORS = [
  "from-p to-p-light", "from-g to-g-light", "from-c to-c-light",
  "from-a to-a-light", "from-v to-purple-400", "from-rose-400 to-pink-400",
];

export default function Members() {
  const { state, dispatch, nextId } = useStore();
  const { addToast } = useToast();

  const [vs, setVS] = useState<ViewState>({ search: "", filter: "", page: 1, sort: { col: "", dir: "" } });

  const [modal, setModal] = useState<{ open: boolean; member?: Member }>({ open: false });
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; member?: Member }>({ open: false });

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formErr, setFormErr] = useState("");

  const filtered = useMemo(() => {
    let items = state.members.filter((m) => {
      const s = vs.search.toLowerCase();
      return !s || m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || m.phone.includes(s);
    });
    items = applySort(items, vs.sort);
    return paginate(items, vs.page);
  }, [state.members, vs]);

  const openAdd = useCallback(() => {
    setForm({ name: "", email: "", phone: "" });
    setFormErr("");
    setModal({ open: true });
  }, []);

  const openEdit = useCallback((member: Member) => {
    setForm({ name: member.name, email: member.email, phone: member.phone });
    setFormErr("");
    setModal({ open: true, member });
  }, []);

  const handleSave = useCallback(() => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name) { setFormErr("Name is required"); return; }
    if (!email) { setFormErr("Email is required"); return; }
    if (!phone) { setFormErr("Phone is required"); return; }

    if (modal.member) {
      dispatch({ type: "UPDATE_MEMBER", payload: { ...modal.member, name, email, phone } });
      addToast("Member updated", "s");
    } else {
      dispatch({
        type: "ADD_MEMBER",
        payload: { id: nextId(), name, email, phone, joined: new Date().toISOString().slice(0, 10) },
      });
      addToast("Member added", "s");
    }
    setModal({ open: false });
  }, [form, modal.member, dispatch, nextId, addToast]);

  const openDel = useCallback((member: Member) => setConfirmDel({ open: true, member }), []);

  const handleDelete = useCallback(() => {
    if (confirmDel.member) {
      dispatch({ type: "DELETE_MEMBER", payload: confirmDel.member.id });
      addToast("Member deleted", "s");
    }
    setConfirmDel({ open: false });
  }, [confirmDel.member, dispatch, addToast]);

  const handleSort = useCallback((col: string) => {
    setVS((prev) => ({
      ...prev,
      page: 1,
      sort: { col, dir: prev.sort.col === col && prev.sort.dir === "asc" ? "dsc" : "asc" },
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setVS((prev) => ({ ...prev, page }));
  }, []);

  return (
    <div className="pt-1">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gg flex items-center justify-center text-g shrink-0">
              <i aria-hidden="true" className="fa-solid fa-users text-xs sm:text-sm" />
            </div>
            <h1 className="text-xl sm:text-[1.45rem] font-extrabold font-heading tracking-tight text-text leading-tight">Members</h1>
          </div>
          <p className="text-xs sm:text-[0.83rem] text-t3 ml-10 sm:ml-[45px]">{state.members.length} registered</p>
        </div>
        <BtnPrimary onClick={openAdd}><i aria-hidden="true" className="fa-solid fa-plus" /> Add Member</BtnPrimary>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <SearchBox
          value={vs.search}
          onChange={(v) => setVS((prev) => ({ ...prev, search: v, page: 1 }))}
          placeholder="Search by name, email, or phone…"
          label="Search members"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full border-collapse text-[0.85rem] min-w-[600px] card-table" aria-label="Members table">
          <thead>
            <tr>
              <SortableTh col="name" label="Member" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <SortableTh col="email" label="Email" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <SortableTh col="phone" label="Phone" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <SortableTh col="joined" label="Joined" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Status</th>
              <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.items.length ? (
              filtered.items.map((m, i) => {
                const borrows = state.transactions.filter(
                  (t) => t.memberName === m.name && !t.returnDate,
                ).length;
                return (
                  <tr key={m.id} className={`border-b border-border last:border-none transition-all duration-[0.15s] hover:bg-s2 ${i % 2 === 1 ? "bg-s2/40" : ""}`}>
                    <td className="px-4 py-3 align-middle" data-label="Member">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[m.id % AVATAR_COLORS.length]} text-white font-bold text-[0.7rem] sm:text-[0.75rem] inline-flex items-center justify-center shrink-0 shadow-xs`}>
                          {m.name[0]}
                        </span>
                        <div>
                          <strong className="text-text font-semibold text-sm sm:text-[0.85rem]">{m.name}</strong>
                          {borrows > 0 && (
                            <div className="text-[0.6rem] sm:text-[0.68rem] text-a mt-0.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-a" />
                              {borrows} active borrow{borrows > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-t2 align-middle" data-label="Email">
                      <span className="text-xs sm:text-[0.85rem]">{m.email}</span>
                    </td>
                    <td className="px-4 py-3 text-t2 align-middle" data-label="Phone">
                      <span className="font-mono text-xs sm:text-[0.82rem]">{m.phone.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-t2 align-middle" data-label="Joined">
                      <span className="text-xs sm:text-[0.78rem]">{m.joined}</span>
                    </td>
                    <td className="px-4 py-3 align-middle" data-label="Status">
                      <span className={`inline-flex items-center gap-1.5 text-[0.6rem] sm:text-[0.65rem] font-bold px-2 sm:px-2.5 py-1 rounded-full border ${
                        borrows === 0
                          ? "bg-gg text-g border-g-border"
                          : "bg-ag text-a border-a-border"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${borrows === 0 ? "bg-g" : "bg-a"}`} />
                        {borrows === 0 ? "Active" : "Borrowing"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle" data-label="">
                      <div className="flex gap-1 items-center justify-end sm:justify-start">
                        <BtnIcon onClick={() => openEdit(m)} aria-label={`Edit ${m.name}`}>
                          <i aria-hidden="true" className="fa-solid fa-pen" />
                        </BtnIcon>
                        <BtnIconDanger onClick={() => openDel(m)} aria-label={`Delete ${m.name}`}>
                          <i aria-hidden="true" className="fa-solid fa-trash" />
                        </BtnIconDanger>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="text-center py-12 sm:py-[60px] text-t3">
                    <i aria-hidden="true" className="fa-solid fa-users-slash text-[1.6rem] sm:text-[2.4rem] opacity-[0.12] block mb-3" />
                    <p className="text-sm sm:text-[0.88rem] font-medium">No members found</p>
                    <p className="text-xs sm:text-[0.78rem] text-t3 mt-1">
                      {vs.search ? "Try a different search term" : "Click 'Add Member' to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={filtered.total} page={filtered.page} maxPage={filtered.maxPage} onPageChange={handlePageChange} label="members" />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gg flex items-center justify-center text-g text-xs">
              <i aria-hidden="true" className={`fa-solid ${modal.member ? "fa-pen" : "fa-plus"}`} />
            </div>
            {modal.member ? "Edit Member" : "Add Member"}
          </div>
        }
        footer={
          <>
            <BtnGhost onClick={() => setModal({ open: false })}>Cancel</BtnGhost>
            <BtnPrimary onClick={handleSave}>{modal.member ? "Save Changes" : "Add Member"}</BtnPrimary>
          </>
        }
      >
        <div className="flex flex-col gap-[5px] mb-4">
          <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Full name"
            className="input"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-0.5">
          <div className="flex-1 flex flex-col gap-[5px] mb-4">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              className="input"
            />
          </div>
          <div className="flex-1 flex flex-col gap-[5px] mb-4">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone"
              className="input"
            />
          </div>
        </div>
        {formErr && (
          <div className="text-[0.72rem] text-r font-semibold flex items-center gap-[5px] mt-0.5 bg-rg px-3 py-2 rounded-md">
            <i aria-hidden="true" className="fa-solid fa-circle-exclamation" />
            {formErr}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={confirmDel.open}
        onClose={() => setConfirmDel({ open: false })}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rg flex items-center justify-center text-r text-xs">
              <i aria-hidden="true" className="fa-solid fa-trash" />
            </div>
            Confirm Delete
          </div>
        }
        size="slim"
        footer={
          <>
            <BtnGhost onClick={() => setConfirmDel({ open: false })}>Cancel</BtnGhost>
            <BtnDanger onClick={handleDelete}>Delete</BtnDanger>
          </>
        }
      >
        <p className="text-sm sm:text-[0.85rem] text-t2 leading-relaxed">
          Delete member <strong className="text-text">"{confirmDel.member?.name || "this member"}"</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
