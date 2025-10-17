import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Sidebar2 } from '@/components/Sidebar2';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import type { User } from '../lib/api';
import { userApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Trash2, Star, StarOff, Plus } from 'lucide-react';

export const Profile = () => {
  const { setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addressEdits, setAddressEdits] = useState<Record<string, any>>({});
  const [addressEditOpen, setAddressEditOpen] = useState<Record<string, boolean>>({});
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', postalCode: '', country: '', isPrimary: false });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    description: '',
    avatar: '',
    gender: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    primaryAddressId: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data.user);
      const primary = (response.data.user.addresses || [])[0] || null;
      const draft: Record<string, any> = {};
      (response.data.user.addresses || []).forEach((a: any) => {
        draft[a.id] = { street: a.street || '', city: a.city || '', postalCode: a.postalCode || '', country: a.country || '', isPrimary: !!a.isPrimary };
      });
      setAddressEdits(draft);
      setAddressEditOpen({});
      setFormData({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        description: response.data.user.description || '',
        avatar: response.data.user.avatar || '',
        gender: response.data.user.gender || '',
        phone: response.data.user.phone || '',
        street: primary?.street || '',
        city: primary?.city || '',
        postalCode: primary?.postalCode || '',
        country: primary?.country || '',
        primaryAddressId: primary?.id || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Sauvegarder d'abord les infos profil
      const { street, city, postalCode, country, primaryAddressId, ...profilePayload } = formData;
      const response = await userApi.updateProfile(profilePayload);
      setProfile(response.data.user);
      setUser(response.data.user);
      toast.success('Profil mis à jour');
      // Sauvegarder l'adresse principale (création ou mise à jour si au moins un champ fourni)
      const hasAddressInput = (street || city || postalCode || country).trim ?
        Boolean((street || '').trim() || (city || '').trim() || (postalCode || '').trim() || (country || '').trim()) :
        Boolean(street || city || postalCode || country);
      if (hasAddressInput) {
        if (primaryAddressId) {
          await userApi.updateAddress(primaryAddressId, { street, city, postalCode, country, isPrimary: true });
        } else {
          await userApi.addAddress({ street, city, postalCode, country, isPrimary: true });
        }
      }
      // Recharger le profil pour refléter adresses
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleAddAddress = async () => {
    setNewAddressOpen(true);
  };

  const handleUpdateAddress = async (addressId: string, data: any) => {
    try {
      await userApi.updateAddress(addressId, data);
      await loadProfile();
      toast.success('Adresse mise à jour');
    } catch (e) {
      toast.error('Erreur lors de la mise à jour de ladresse');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    try {
      await userApi.deleteAddress(addressId);
      await loadProfile();
      toast.success('Adresse supprimée');
    } catch (e) {
      toast.error('Erreur lors de la suppression de ladresse');
    }
  };

  const getInitials = () => {
    if (!profile) return '?';
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const formatGender = (g?: string | null) => {
    if (!g) return 'Non renseigné';
    switch (g) {
      case 'MALE':
        return 'Homme';
      case 'FEMALE':
        return 'Femme';
      case 'OTHER':
        return 'Autre';
      case 'PREFER_NOT_TO_SAY':
        return 'Préférer ne pas dire';
      default:
        return 'Non renseigné';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mon Profil</CardTitle>
              {!isEditing ? (
                <Button className='cursor-pointer' onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" type="button">
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button className='cursor-pointer' onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : (
            <div className="flex items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile?.avatar || formData.avatar} />
                <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Prénom</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Nom</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Genre</label>
                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="border rounded-md h-9 px-2 w-full">
                      <option value="">Non renseigné</option>
                      <option value="MALE">Homme</option>
                      <option value="FEMALE">Femme</option>
                      <option value="OTHER">Autre</option>
                      <option value="PREFER_NOT_TO_SAY">Préférer ne pas dire</option>
                    </select>
                  </div>
                </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Rue</label>
                        <Input
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          placeholder="10 rue de Paris"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ville</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Paris"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Code postal</label>
                        <Input
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          placeholder="75000"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pays</label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="France"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL Avatar</label>
                      <Input
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Parlez-nous de vous..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profile?.firstName} {profile?.lastName}
                      </h2>
                      <p className="text-muted-foreground">{profile?.email}</p>
                    </div>
                    {profile?.addresses && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Adresses</p>
                          <Button size="sm" variant="outline" className="cursor-pointer" onClick={handleAddAddress}>
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                          </Button>
                        </div>
                        {newAddressOpen && (
                          <div className="rounded-md border p-3 bg-muted/40">
                            <div className="grid grid-cols-2 gap-2">
                              <Input value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="Rue" />
                              <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="Ville" />
                              <Input value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} placeholder="Code postal" />
                              <Input value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} placeholder="Pays" />
                              <div className="col-span-2 flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setNewAddressOpen(false)}>Annuler</Button>
                                <Button size="sm" className="cursor-pointer" onClick={async () => {
                                  try {
                                    if (!newAddress.street || !newAddress.city || !newAddress.postalCode || !newAddress.country) {
                                      toast.error('Veuillez renseigner tous les champs');
                                      return;
                                    }
                                    await userApi.addAddress(newAddress as any);
                                    toast.success('Adresse créée');
                                    setNewAddressOpen(false);
                                    setNewAddress({ street: '', city: '', postalCode: '', country: '', isPrimary: false });
                                    await loadProfile();
                                  } catch (err) {
                                    toast.error("Erreur lors de la création de l'adresse");
                                  }
                                }}>Créer</Button>
                              </div>
                            </div>
                          </div>
                        )}
                        {profile.addresses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Aucune adresse</p>
                        ) : (
                          <div className="space-y-2">
                            {profile.addresses.map((addr: any) => (
                              <div key={addr.id} className="rounded-md border p-3">
                                {addressEditOpen[addr.id] ? (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input value={addressEdits[addr.id]?.street || ''} onChange={(e) => setAddressEdits((prev) => ({ ...prev, [addr.id]: { ...prev[addr.id], street: e.target.value } }))} placeholder="Rue" />
                                    <Input value={addressEdits[addr.id]?.city || ''} onChange={(e) => setAddressEdits((prev) => ({ ...prev, [addr.id]: { ...prev[addr.id], city: e.target.value } }))} placeholder="Ville" />
                                    <Input value={addressEdits[addr.id]?.postalCode || ''} onChange={(e) => setAddressEdits((prev) => ({ ...prev, [addr.id]: { ...prev[addr.id], postalCode: e.target.value } }))} placeholder="Code postal" />
                                    <Input value={addressEdits[addr.id]?.country || ''} onChange={(e) => setAddressEdits((prev) => ({ ...prev, [addr.id]: { ...prev[addr.id], country: e.target.value } }))} placeholder="Pays" />
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setAddressEditOpen((p) => ({ ...p, [addr.id]: false }))}>Annuler</Button>
                                      <Button size="sm" className="cursor-pointer" onClick={() => handleUpdateAddress(addr.id, addressEdits[addr.id])}>Enregistrer</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="font-semibold">{addr.street}, {addr.postalCode} {addr.city}</p>
                                      <p className="text-sm text-muted-foreground">{addr.country}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setAddressEditOpen((p) => ({ ...p, [addr.id]: true }))}>Éditer</Button>
                                      <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => handleUpdateAddress(addr.id, { isPrimary: true })}>
                                        {addr.isPrimary ? <><Star className="h-4 w-4 mr-2" /> Principale</> : <><StarOff className="h-4 w-4 mr-2" /> Définir principale</>}
                                      </Button>
                                      <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => handleDeleteAddress(addr.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(profile?.phone || profile?.gender) && (
                      <div className="grid grid-cols-2 gap-4">
                        {profile?.phone && (
                          <div>
                            <p className="text-sm text-muted-foreground">Téléphone</p>
                            <p className="font-semibold">{profile.phone}</p>
                          </div>
                        )}
                        {profile?.gender && (
                          <div>
                            <p className="text-sm text-muted-foreground">Genre</p>
                            <p className="font-semibold">{formatGender(profile.gender)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {profile?.description && (
                      <div>
                        <h3 className="font-semibold mb-1">À propos</h3>
                        <p className="text-muted-foreground">{profile.description}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Membre depuis</p>
                      <p className="font-semibold">
                        {new Date(profile?.createdAt || '').toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Sidebar2 />
    </div>
  );
};

