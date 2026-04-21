import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import { Plus, Edit, Trash2, X, Menu, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: '0' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      setCategories(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: '', description: '', sortOrder: '0' });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder?.toString() || '0' });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Delete failed'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('sortOrder', form.sortOrder);
      if (imageFile) formData.append('image', imageFile);

      if (editCat) {
        await updateCategory(editCat._id, formData);
        toast.success('Category updated!');
      } else {
        await createCategory(formData);
        toast.success('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }} className="admin-mobile-header">
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><Menu size={22} /></button>
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>Manage Categories</span>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Admin</p>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8' }}>Categories</h1>
            </div>
            <button onClick={openAdd} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}>
              <Plus size={18} /> Add Category
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#6B6560', textAlign: 'center', padding: '3rem' }}>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {categories.map((cat) => (
                <div key={cat._id} className="glass-card" style={{ padding: '1.25rem', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: '#F5F0E8', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{cat.name}</h3>
                      {cat.description && <p style={{ color: '#6B6560', fontSize: '0.8rem', marginBottom: '8px' }}>{cat.description}</p>}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', color: '#A0998A', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>/{cat.slug}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', background: cat.isActive ? 'rgba(46,204,113,0.12)' : 'rgba(232,69,60,0.12)', color: cat.isActive ? '#2ECC71' : '#E8453C' }}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button onClick={() => openEdit(cat)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}><Edit size={13} /></button>
                      <button onClick={() => handleDelete(cat._id, cat.name)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(232,69,60,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8453C' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <>
          <div className="overlay" onClick={() => setShowModal(false)} style={{ zIndex: 60 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 65, padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#F5F0E8' }}>{editCat ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#A0998A', display: 'flex' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[{ label: 'Category Name *', key: 'name' }, { label: 'Description', key: 'description' }, { label: 'Sort Order', key: 'sortOrder', type: 'number' }].map(({ label, key, type }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
                    <input type={type || 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-gold" style={{ padding: '10px 14px' }} />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category Image</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#6B6560' }}>
                    <Upload size={16} />
                    {imageFile ? imageFile.name : 'Upload Image'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files[0])} />
                  </label>
                </div>

                <button type="submit" className="btn-gold" disabled={saving} style={{ width: '100%', padding: '13px', borderRadius: '12px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : editCat ? 'Update' : 'Create Category'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <style>{`.admin-mobile-header { display: none; } @media (max-width: 767px) { .admin-mobile-header { display: flex; } }`}</style>
    </div>
  );
};

export default ManageCategories;
