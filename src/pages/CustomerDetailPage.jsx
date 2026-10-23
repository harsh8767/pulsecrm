import { useState } from "react";
import { Link, useParams } from "react-router-dom";

function createNoteId() {
  return Date.now();
}

function CustomerDetailPage({ customers, onUpdateCustomer }) {
  const { customerId } = useParams();
  const [noteText, setNoteText] = useState("");
  const [editDraft, setEditDraft] = useState(null);

  const customer = customers.find(
    (customer) => customer.id === Number(customerId)
  );

  if (!customer) {
    return (
      <>
        <p>Customer not found.</p>
        <Link className="customer-link" to="/customers">
          Back to customers
        </Link>
      </>
    );
  }

  const notes = customer.notes || [];
  const isEditing = editDraft !== null;

  function handleStartEditing() {
    setEditDraft({
      name: customer.name,
      company: customer.company,
      dealValue: String(customer.dealValue || 0),
    });
  }

  function handleDraftChange(fieldName, newValue) {
    setEditDraft({ ...editDraft, [fieldName]: newValue });
  }

  function handleSaveEdit(event) {
    event.preventDefault();

    const trimmedName = editDraft.name.trim();
    const trimmedCompany = editDraft.company.trim();

    if (trimmedName === "" || trimmedCompany === "") {
      return;
    }

    onUpdateCustomer(customer.id, {
      name: trimmedName,
      company: trimmedCompany,
      dealValue: Math.max(0, Number(editDraft.dealValue) || 0),
    });

    setEditDraft(null);
  }

  function handleAddNote(event) {
    event.preventDefault();

    const trimmedNote = noteText.trim();
    if (trimmedNote === "") {
      return;
    }

    const newNote = { id: createNoteId(), text: trimmedNote };
    onUpdateCustomer(customer.id, { notes: [...notes, newNote] });
    setNoteText("");
  }

  function handleDeleteNote(noteId) {
    const remainingNotes = notes.filter((note) => note.id !== noteId);
    onUpdateCustomer(customer.id, { notes: remainingNotes });
  }

  return (
    <div className="detail-card">
      {isEditing ? (
        <form className="edit-form" onSubmit={handleSaveEdit}>
          <label>
            Name
            <input
              className="search-input"
              type="text"
              value={editDraft.name}
              onChange={(event) => handleDraftChange("name", event.target.value)}
            />
          </label>
          <label>
            Company
            <input
              className="search-input"
              type="text"
              value={editDraft.company}
              onChange={(event) =>
                handleDraftChange("company", event.target.value)
              }
            />
          </label>
          <label>
            Deal value (Rs.)
            <input
              className="search-input"
              type="number"
              min="0"
              value={editDraft.dealValue}
              onChange={(event) =>
                handleDraftChange("dealValue", event.target.value)
              }
            />
          </label>
          <div className="detail-actions">
            <button className="reset-button" type="submit">
              Save
            </button>
            <button
              className="reset-button"
              type="button"
              onClick={() => setEditDraft(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="detail-name">{customer.name}</h2>
          <p>{customer.company}</p>
          <p>Status: {customer.status}</p>
          <p>Deal value: ${(customer.dealValue || 0).toLocaleString()}</p>
          <p>
            Added:{" "}
            {customer.createdAt
              ? new Date(customer.createdAt).toLocaleDateString()
              : "Unknown"}
          </p>
          <button
            className="reset-button"
            type="button"
            onClick={handleStartEditing}
          >
            Edit customer
          </button>
        </>
      )}

      <h3>Notes</h3>

      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li className="note-item" key={note.id}>
              <span>{note.text}</span>
              <button
                className="delete-button"
                onClick={() => handleDeleteNote(note.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddNote}>
        <input
          className="search-input"
          type="text"
          placeholder="Add a note..."
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
        />
        <button className="reset-button" type="submit">
          Add note
        </button>
      </form>

      <Link className="customer-link" to="/customers">
        Back to customers
      </Link>
    </div>
  );
}

export default CustomerDetailPage;