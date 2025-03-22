// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth } from "../../firebase";
// import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, updateDoc, query, where, orderBy } from "firebase/firestore";
// import AdminNav from "../../components/AdminNav";
// import { BookOpen, Edit, Trash2, Search, Star, MapPin, Eye, Filter, ArrowUp, ArrowDown, CheckCircle, XCircle } from "lucide-react";

// const GuidesList = () => {
//     const [loading, setLoading] = useState(true);
//     const [guides, setGuides] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("all");
//     const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
//     const [guideToDelete, setGuideToDelete] = useState(null);
//     const [sortField, setSortField] = useState("createdAt");
//     const [sortDirection, setSortDirection] = useState("desc");
//     const [categories, setCategories] = useState([]);

//     const navigate = useNavigate();
//     const db = getFirestore();

//     useEffect(() => {
//         const checkAdmin = async () => {
//             // const user = auth.currentUser;
//             // if (!user) {
//             //     navigate("/login");
//             //     return;
//             // }

//             const userDoc = await getDoc(doc(db, "users", user.uid));
//             const userData = userDoc.data();

//             if (!userData || userData.role !== "admin") {
//                 navigate("/");
//                 return;
//             }

//             await fetchCategories();
//             await fetchGuides();
//             setLoading(false);
//         };

//         checkAdmin();
//     }, [navigate, db]);

//     const fetchCategories = async () => {
//         try {
//             const categoriesSnapshot = await getDocs(collection(db, "categories"));
//             const categoriesData = categoriesSnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 name: doc.data().name
//             }));
//             setCategories(categoriesData);
//         } catch (error) {
//             console.error("Error fetching categories:", error);
//         }
//     };

//     const fetchGuides = async () => {
//         try {
//             const guidesQuery = query(
//                 collection(db, "guides"),
//                 orderBy(sortField, sortDirection)
//             );
//             const guidesSnapshot = await getDocs(guidesQuery);

//             const guidesData = await Promise.all(guidesSnapshot.docs.map(async (doc) => {
//                 const guideData = doc.data();

//                 // Get author info
//                 let authorData = { displayName: "Unknown" };
//                 if (guideData.authorId) {
//                     const authorDoc = await getDoc(doc(db, "users", guideData.authorId));
//                     if (authorDoc.exists()) {
//                         authorData = authorDoc.data();
//                     }
//                 }

//                 return {
//                     id: doc.id,
//                     ...guideData,
//                     createdAt: guideData.createdAt?.toDate().toLocaleDateString() || "N/A",
//                     author: authorData.displayName || authorData.email || "Anonymous",
//                     authorPhoto: authorData.photoURL
//                 };
//             }));

//             setGuides(guidesData);
//         } catch (error) {
//             console.error("Error fetching guides:", error);
//         }
//     };

//     const handleDeleteGuide = async () => {
//         if (!guideToDelete) return;

//         try {
//             await deleteDoc(doc(db, "guides", guideToDelete.id));
//             setGuides(guides.filter(guide => guide.id !== guideToDelete.id));
//             setIsConfirmModalOpen(false);
//             setGuideToDelete(null);
//         } catch (error) {
//             console.error("Error deleting guide:", error);
//         }
//     };

//     const handleFeaturedToggle = async (guideId, currentStatus) => {
//         try {
//             await updateDoc(doc(db, "guides", guideId), {
//                 featured: !currentStatus
//             });

//             setGuides(guides.map(guide =>
//                 guide.id === guideId ? { ...guide, featured: !currentStatus } : guide
//             ));
//         } catch (error) {
//             console.error("Error updating guide featured status:", error);
//         }
//     };

//     const handleApprovalToggle = async (guideId, currentStatus) => {
//         try {
//             await updateDoc(doc(db, "guides", guideId), {
//                 approved: !currentStatus
//             });

//             setGuides(guides.map(guide =>
//                 guide.id === guideId ? { ...guide, approved: !currentStatus } : guide
//             ));
//         } catch (error) {
//             console.error("Error updating guide approval status:", error);
//         }
//     };

//     const handleSort = (field) => {
//         if (sortField === field) {
//             setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//         } else {
//             setSortField(field);
//             setSortDirection("desc");
//         }

//         // For frontend sorting when not refetching from Firestore
//         const sortedGuides = [...guides].sort((a, b) => {
//             let aValue = a[field];
//             let bValue = b[field];

//             if (field === "rating") {
//                 aValue = parseFloat(a.rating || 0);
//                 bValue = parseFloat(b.rating || 0);
//             }

//             if (sortDirection === "asc") {
//                 return aValue > bValue ? 1 : -1;
//             } else {
//                 return aValue < bValue ? 1 : -1;
//             }
//         });

//         setGuides(sortedGuides);
//     };

//     const filteredGuides = guides.filter(guide => {
//         const matchesSearch =
//             guide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             guide.destination?.toLowerCase().includes(searchTerm.toLowerCase());

//         const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;

//         return matchesSearch && matchesCategory;
//     });

//     const getSortIcon = (field) => {
//         if (sortField !== field) return null;
//         return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
//     };

//     if (loading) return (
//         <div className="flex justify-center items-center h-screen">
//             <p className="text-lg text-gray-600">Loading guides...</p>
//         </div>
//     );

//     return (
//         <div className="flex flex-row bg-gray-50 min-h-screen">
//             {/* Left Sidebar - Admin Navigation */}
//             <div className="w-1/4">
//                 <AdminNav />
//             </div>

//             {/* Right Side - Guides List */}
//             <div className="p-6 ml-64 w-full">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="flex justify-between items-center mb-6">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-800">Guides Management</h1>
//                             <p className="text-gray-500">Manage your travel guides content</p>
//                         </div>
//                         <button
//                             className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"
//                             onClick={() => navigate("/admin/guides/create")}
//                         >
//                             <BookOpen size={16} className="mr-2" />
//                             Create New Guide
//                         </button>
//                     </div>

//                     {/* Filters */}
//                     <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//                         <div className="flex flex-col md:flex-row gap-4">
//                             <div className="flex items-center relative flex-1">
//                                 <Search size={20} className="absolute left-3 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search guides by title or destination..."
//                                     className="pl-10 pr-4 py-2 border rounded-lg w-full"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                             </div>
//                             <div className="flex items-center">
//                                 <Filter size={18} className="text-gray-500 mr-2" />
//                                 <select
//                                     className="border rounded-lg px-3 py-2"
//                                     value={selectedCategory}
//                                     onChange={(e) => setSelectedCategory(e.target.value)}
//                                 >
//                                     <option value="all">All Categories</option>
//                                     {categories.map(category => (
//                                         <option key={category.id} value={category.id}>
//                                             {category.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Guides Table */}
//                     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th
//                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                                             onClick={() => handleSort("title")}
//                                         >
//                                             <div className="flex items-center">
//                                                 Guide Title {getSortIcon("title")}
//                                             </div>
//                                         </th>
//                                         <th
//                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                                             onClick={() => handleSort("destination")}
//                                         >
//                                             <div className="flex items-center">
//                                                 Destination {getSortIcon("destination")}
//                                             </div>
//                                         </th>
//                                         <th
//                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                                             onClick={() => handleSort("author")}
//                                         >
//                                             <div className="flex items-center">
//                                                 Author {getSortIcon("author")}
//                                             </div>
//                                         </th>
//                                         <th
//                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                                             onClick={() => handleSort("rating")}
//                                         >
//                                             <div className="flex items-center">
//                                                 Rating {getSortIcon("rating")}
//                                             </div>
//                                         </th>
//                                         <th
//                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                                             onClick={() => handleSort("createdAt")}
//                                         >
//                                             <div className="flex items-center">
//                                                 Created {getSortIcon("createdAt")}
//                                             </div>
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {filteredGuides.length > 0 ? (
//                                         filteredGuides.map((guide) => (
//                                             <tr key={guide.id} className="hover:bg-gray-50">
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="flex items-center">
//                                                         <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
//                                                             {guide.coverImage ? (
//                                                                 <img className="h-10 w-10 object-cover" src={guide.coverImage} alt={guide.title} />
//                                                             ) : (
//                                                                 <BookOpen size={20} className="text-gray-400" />
//                                                             )}
//                                                         </div>
//                                                         <div className="ml-4">
//                                                             <div className="text-sm font-medium text-gray-900 flex items-center">
//                                                                 {guide.title}
//                                                                 {guide.featured && (
//                                                                     <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
//                                                                         Featured
//                                                                     </span>
//                                                                 )}
//                                                             </div>
//                                                             <div className="text-xs text-gray-500 mt-1">
//                                                                 {guide.views || 0} views • {guide.likes || 0} likes
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="text-sm text-gray-900 flex items-center">
//                                                         <MapPin size={16} className="text-gray-400 mr-2" />
//                                                         {guide.destination || "Not specified"}
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="flex items-center">
//                                                         <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
//                                                             {guide.authorPhoto ? (
//                                                                 <img src={guide.authorPhoto} alt={guide.author} className="h-full w-full object-cover" />
//                                                             ) : (
//                                                                 <div className="h-full w-full flex items-center justify-center">
//                                                                     <span className="text-xs text-gray-500">{guide.author?.charAt(0)?.toUpperCase()}</span>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                         <span className="ml-2 text-sm text-gray-900">{guide.author}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="flex items-center">
//                                                         <Star size={16} className="text-yellow-400 mr-1" />
//                                                         <span className="text-sm text-gray-900">{guide.rating?.toFixed(1) || "No ratings"}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                     {guide.createdAt}
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${guide.approved
//                                                             ? 'bg-green-100 text-green-800'
//                                                             : 'bg-red-100 text-red-800'
//                                                         }`}>
//                                                         {guide.approved ? 'Approved' : 'Pending'}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                                     <div className="flex space-x-2">
//                                                         <button
//                                                             onClick={() => navigate(`/admin/guides/edit/${guide.id}`)}
//                                                             className="text-indigo-600 hover:text-indigo-900"
//                                                             title="Edit guide"
//                                                         >
//                                                             <Edit size={18} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => navigate(`/guide/${guide.id}`)}
//                                                             className="text-blue-600 hover:text-blue-900"
//                                                             title="View guide"
//                                                         >
//                                                             <Eye size={18} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => {
//                                                                 setGuideToDelete(guide);
//                                                                 setIsConfirmModalOpen(true);
//                                                             }}
//                                                             className="text-red-600 hover:text-red-900"
//                                                             title="Delete guide"
//                                                         >
//                                                             <Trash2 size={18} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleFeaturedToggle(guide.id, guide.featured)}
//                                                             className={`hover:text-yellow-900 ${guide.featured ? 'text-yellow-500' : 'text-gray-400'}`}
//                                                             title={guide.featured ? "Remove from featured" : "Add to featured"}
//                                                         >
//                                                             <Star size={18} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleApprovalToggle(guide.id, guide.approved)}
//                                                             className={`${guide.approved ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
//                                                             title={guide.approved ? "Unapprove guide" : "Approve guide"}
//                                                         >
//                                                             {guide.approved ? <CheckCircle size={18} /> : <XCircle size={18} />}
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
//                                                 <div className="flex flex-col items-center justify-center">
//                                                     <BookOpen size={48} className="text-gray-300 mb-2" />
//                                                     <p className="text-lg font-medium">No guides found</p>
//                                                     <p className="text-sm mt-1">Try adjusting your search or filter</p>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Confirmation Modal */}
//             {isConfirmModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg p-6 max-w-md w-full">
//                         <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
//                         <p className="text-gray-600 mb-6">
//                             Are you sure you want to delete "{guideToDelete?.title}"? This action cannot be undone.
//                         </p>
//                         <div className="flex justify-end space-x-3">
//                             <button
//                                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
//                                 onClick={() => {
//                                     setIsConfirmModalOpen(false);
//                                     setGuideToDelete(null);
//                                 }}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="px-4 py-2 bg-red-600 text-white rounded-lg"
//                                 onClick={handleDeleteGuide}
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GuidesList;