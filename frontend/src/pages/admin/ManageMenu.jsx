import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getMenuItems, getAllCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { Plus, Edit, Trash2, X, Menu, Upload, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const FOOD_TYPES = ['veg', 'nonveg', 'jain', 'vegan'];
const SPICE_LEVELS = ['mild', 'medium', 'hot', 'extra-hot'];
const EMPTY_FORM = { name: '', description: '', shortDescription: '', price: '', category: '', foodType: 'veg', spiceLevel: 'medium', ingredients: '', portionSize: 'Regular', rating: '4.5', preparationTime: '15', bestseller: false, featured: false, available: true };

const ManageMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes] = await Promise.all([getMenuItems({ limit: 100 }), getAllCategories()]);
      setItems(itemsRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setModelFile(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description, shortDescription: item.shortDescription || '',
      price: item.price, category: item.category?._id || '', foodType: item.foodType,
      spiceLevel: item.spiceLevel, ingredients: item.ingredients?.join(', ') || '',
      portionSize: item.portionSize || 'Regular', rating: item.rating, preparationTime: item.preparationTime,
      bestseller: item.bestseller, featured: item.featured, available: item.available,
    });
    setImageFile(null);
    setModelFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteMenuItem(id);
      toast.success('Dish deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Name, price, and category are required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      const ingredientsArr = form.ingredients.split(',').map((s) => s.trim()).filter(Boolean);

      Object.entries({ ...form, ingredients: JSON.stringify(ingredientsArr) }).forEach(([k, v]) => {
        if (typeof v === 'boolean') formData.append(k, v.toString());
        else formData.append(k, v);
      });

      if (imageFile) formData.append('image', imageFile);
      if (modelFile) formData.append('arModel', modelFile);

      if (editItem) {
        await updateMenuItem(editItem._id, formData);
        toast.success('Dish updated!');
      } else {
        await createMenuItem(formData);
        toast.success('Dish created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const F = ({ label, name, type = 'text', options }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
      {options ? (
        <select value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input-gold" style={{ padding: '10px 14px' }}>
          {options.map((o) => <option key={o.v} value={o.v} style={{ background: '#1A1A1A' }}>{o.l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input-gold" style={{ padding: '10px 14px' }} />
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <AdminSidebar mobileOpen={mobileMenu} setMobileOpen={setMobileMenu} />
      <main style={{ flex: 1, overflowX: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111' }} className="admin-mobile-header">
          <button onClick={() => setMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#F5F0E8', cursor: 'pointer', display: 'flex' }}><Menu size={22} /></button>
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>Manage Menu</span>
        </div>

        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0.25rem' }}>Admin</p>
              <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#F5F0E8' }}>Manage Menu</h1>
            </div>
            <button onClick={openAdd} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}>
              <Plus size={18} /> Add Dish
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#6B6560', textAlign: 'center', padding: '3rem' }}>Loading dishes...</p>
          ) : (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Dish', 'Category', 'Price', 'Type', 'Status', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={getImageUrl(item.image)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&auto=format'; }} />
                            </div>
                            <div>
                              <p style={{ color: '#F5F0E8', fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</p>
                              <p style={{ color: '#6B6560', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={10} color="#D4AF37" fill="#D4AF37" />{item.rating?.toFixed(1)}
                                {item.bestseller && <span style={{ color: '#D4AF37', marginLeft: '4px' }}>★ Best Seller</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#A0998A', fontSize: '0.85rem' }}>{item.category?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(item.price)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', background: item.foodType === 'veg' ? 'rgba(46,204,113,0.12)' : item.foodType === 'nonveg' ? 'rgba(232,69,60,0.12)' : 'rgba(243,156,18,0.12)', color: item.foodType === 'veg' ? '#2ECC71' : item.foodType === 'nonveg' ? '#E8453C' : '#F39C12' }}>
                            {item.foodType}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: item.available ? 'rgba(46,204,113,0.12)' : 'rgba(232,69,60,0.12)', color: item.available ? '#2ECC71' : '#E8453C' }}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openEdit(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}><Edit size={14} /></button>
                            <button onClick={() => handleDelete(item._id, item.name)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(232,69,60,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8453C' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <>
          <div className="overlay" onClick={() => setShowModal(false)} style={{ zIndex: 60 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(560px, 100vw)', background: '#111', borderLeft: '1px solid rgba(255,255,255,0.06)', zIndex: 65, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#111', zIndex: 1 }}>
              <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F5F0E8' }}>
                {editItem ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#A0998A', display: 'flex' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}><F label="Dish Name *" name="name" /></div>
                <F label="Price (₹) *" name="price" type="number" />
                <F label="Category *" name="category" options={[{ v: '', l: 'Select category' }, ...categories.map((c) => ({ v: c._id, l: c.name }))]} />
                <F label="Food Type *" name="foodType" options={FOOD_TYPES.map((f) => ({ v: f, l: f.charAt(0).toUpperCase() + f.slice(1) }))} />
                <F label="Spice Level" name="spiceLevel" options={SPICE_LEVELS.map((s) => ({ v: s, l: s.charAt(0).toUpperCase() + s.slice(1) }))} />
                <F label="Portion Size" name="portionSize" />
                <F label="Prep Time (min)" name="preparationTime" type="number" />
                <F label="Rating (0-5)" name="rating" type="number" />
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Short Description</label>
                  <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="input-gold" style={{ padding: '10px 14px' }} placeholder="One-line summary" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-gold" style={{ padding: '10px 14px', resize: 'vertical', minHeight: '80px' }} placeholder="Full description..." />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ingredients (comma separated)</label>
                  <input value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input-gold" style={{ padding: '10px 14px' }} placeholder="Tomato, Onion, Garlic..." />
                </div>

                {/* Toggles */}
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[['bestseller', '⭐ Best Seller'], ['featured', '🔥 Featured'], ['available', '✅ Available']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#A0998A' }}>
                      <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} style={{ accentColor: '#D4AF37', width: '16px', height: '16px' }} />
                      {label}
                    </label>
                  ))}
                </div>

                {/* Image upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Food Image</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#6B6560' }}>
                    <Upload size={16} />
                    {imageFile ? imageFile.name : editItem?.image ? 'Change image' : 'Upload image'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files[0])} />
                  </label>
                </div>

                {/* AR Model upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#A0998A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>AR Model (.glb)</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.2)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#6B6560' }}>
                    <Upload size={16} />
                    {modelFile ? modelFile.name : editItem?.arModelFile ? 'Change model' : 'Upload .glb'}
                    <input type="file" accept=".glb,.gltf" style={{ display: 'none' }} onChange={(e) => setModelFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-gold" disabled={saving} style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px', marginTop: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : editItem ? 'Update Dish' : 'Create Dish'}
              </button>
            </form>
          </div>
        </>
      )}

      <style>{`.admin-mobile-header { display: none; } @media (max-width: 767px) { .admin-mobile-header { display: flex; } }`}</style>
    </div>
  );
};

export default ManageMenu;
