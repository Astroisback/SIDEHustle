"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Star, ShieldCheck, ArrowRight, User, X, ShoppingBag, Package, Home, ShoppingCart, ChevronDown, ChevronUp, Briefcase, Languages, Calendar, CreditCard, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, limit, doc, getDoc } from "firebase/firestore";
import { translations } from "@/utils/translations";

export default function CustomerLandingPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        phone: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [topEntrepreneurs, setTopEntrepreneurs] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [trendingServices, setTrendingServices] = useState([]);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [language, setLanguage] = useState("en");
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const t = translations[language];

    // Check if user is already logged in
    useEffect(() => {
        setMounted(true);
        const customerId = localStorage.getItem("customerId");
        const storedName = localStorage.getItem("customerName");
        if (customerId) {
            setIsLoggedIn(true);
            setCustomerName(storedName || "User");
        }
        fetchTopEntrepreneurs();
        fetchTrendingData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/customer/explore?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const fetchTopEntrepreneurs = async () => {
        try {
            const sellersSnapshot = await getDocs(collection(db, "sellers"));
            const sellers = [];
            sellersSnapshot.forEach((doc) => {
                sellers.push({ id: doc.id, ...doc.data() });
            });

            const reviewsSnapshot = await getDocs(collection(db, "reviews"));
            const reviews = [];
            reviewsSnapshot.forEach((doc) => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            const sellersWithRatings = sellers.map(seller => {
                const sellerReviews = reviews.filter(review => review.sellerId === seller.id);
                const avgRating = sellerReviews.length > 0
                    ? sellerReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / sellerReviews.length
                    : 0;

                return {
                    ...seller,
                    rating: avgRating,
                    reviewCount: sellerReviews.length
                };
            });

            const topRated = sellersWithRatings
                .filter(seller => seller.rating > 0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);

            setTopEntrepreneurs(topRated);
        } catch (error) {
            console.error("Error fetching top entrepreneurs:", error);
        }
    };

    const fetchTrendingData = async () => {
        try {
            // Fetch Trending Products - filter client-side for sellerId
            const productsQuery = query(collection(db, "products"), limit(20)); // Fetch more to ensure we get 5 valid ones
            const productsSnapshot = await getDocs(productsQuery);
            const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter to only include products with a valid sellerId (not null, undefined, or empty string)
            const validProducts = allProducts.filter(product =>
                product.sellerId && product.sellerId.trim() !== ""
            ).slice(0, 5); // Take only first 5

            setTrendingProducts(validProducts);

            // Fetch Trending Services (from root 'services' collection)
            const servicesQuery = query(collection(db, "services"), where("isActive", "==", true), limit(5));
            const servicesSnapshot = await getDocs(servicesQuery);
            const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrendingServices(services);

        } catch (error) {
            console.error("Error fetching trending data:", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const q = query(
                collection(db, "customers"),
                where("username", "==", formData.username),
                where("password", "==", formData.password)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const customerData = querySnapshot.docs[0].data();
                localStorage.setItem("customerId", querySnapshot.docs[0].id);
                localStorage.setItem("customerName", customerData.name);
                alert(`${t.welcomeBack}, ${customerData.name}!`);
                router.push("/customer/dashboard");
            } else {
                setError(t.invalidCredentials);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password.length < 8) {
            setError(t.passwordLength);
            setLoading(false);
            return;
        }

        if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
            setError(t.validPhone);
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, "customers"),
                where("username", "==", formData.username)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setError(t.usernameExists);
                setLoading(false);
                return;
            }

            const docRef = await addDoc(collection(db, "customers"), {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                createdAt: new Date()
            });

            localStorage.setItem("customerId", docRef.id);
            localStorage.setItem("customerName", formData.name);
            alert(`${t.accountCreated}! ${t.welcomeBack}, ${formData.name}!`);
            router.push("/customer/dashboard");
        } catch (err) {
            console.error("Signup error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: t.beautyServices, icon: "💄", color: "bg-pink-100" },
        { name: t.homemadeFood, icon: "🍲", color: "bg-orange-100" },
        { name: t.tailoring, icon: "🧵", color: "bg-blue-100" },
        { name: t.smallShops, icon: "🏪", color: "bg-green-100" },
        { name: t.handicrafts, icon: "🎨", color: "bg-purple-100" },
        { name: t.others, icon: "📦", color: "bg-gray-100" },
    ];

    // Booking State
    const [selectedService, setSelectedService] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingLocation, setBookingLocation] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState("");

    const handleBookNow = async (service) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
        setBookingDate("");
        setBookingTime("");
        setBookingLocation("");
        setPaymentMethod("upi");
        setAvailableSlots([]);
        setAvailabilityMessage("");
    };

    const handleDateChange = async (selectedDate) => {
        setBookingDate(selectedDate);
        setBookingTime("");
        setAvailableSlots([]);
        setAvailabilityMessage("");

        if (!selectedDate || !selectedService) return;

        setBookingLoading(true);
        try {
            // Get defined slots from service
            const definedSlots = selectedService.timeSlots || [];

            if (definedSlots.length === 0) {
                setAvailabilityMessage(t.noSlots);
                return;
            }

            // Fetch existing bookings for this service and date
            const q = query(
                collection(db, "bookings"),
                where("serviceId", "==", selectedService.id),
                where("selectedDate", "==", selectedDate),
                where("status", "==", "approved")
            );
            const snapshot = await getDocs(q);
            const bookedSlots = snapshot.docs.map(doc => doc.data().selectedTimeSlot);

            // Filter available slots
            const available = definedSlots.filter(slot => {
                const slotString = `${slot.startTime} - ${slot.endTime}`;
                return !bookedSlots.includes(slotString);
            });

            if (available.length > 0) {
                setAvailableSlots(available);
            } else {
                setAvailabilityMessage(t.noSlots);
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
            setAvailabilityMessage(t.errorLoading);
        } finally {
            setBookingLoading(false);
        }
    };

    const confirmBooking = async () => {
        if (!bookingDate || !bookingTime || !bookingLocation) {
            alert(t.selectBoth); // Update translation to include location
            return;
        }

        if (!isLoggedIn) {
            alert(t.loginToBook);
            setShowModal(true);
            return;
        }

        setBookingLoading(true);
        try {
            await addDoc(collection(db, "bookings"), {
                customerId: localStorage.getItem("customerId"),
                customerName: customerName,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                sellerId: selectedService.sellerId,
                serviceFee: selectedService.price,
                selectedDate: bookingDate,
                selectedTimeSlot: bookingTime,
                location: bookingLocation,
                paymentMethod: paymentMethod,
                status: "pending",
                createdAt: new Date()
            });

            alert(t.booked);
            setIsBookingModalOpen(false);
            setBookingDate("");
            setBookingTime("");
            setBookingLocation("");
            setSelectedService(null);
        } catch (error) {
            console.error("Error creating booking:", error);
            alert(t.failedBooking);
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pb-20 relative overflow-hidden">
            {/* Decorative Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink-200/20 blur-3xl" />
                <div className="absolute top-64 -right-32 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl" />
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg p-4 shadow-lg sticky top-0 z-10 border-b border-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-pink-200">
                                <Image
                                    src="/logo.png"
                                    alt="SIDEHustle Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">{t.brandName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setLanguage(prev => prev === "en" ? "hi" : "en")}
                                className="flex items-center gap-1 px-3 py-2 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl text-sm font-medium text-gray-700 transition-all shadow-sm border border-white/50"
                            >
                                <Languages size={18} />
                                {language === "en" ? "EN" : "HI"}
                            </button>
                            {mounted && (isLoggedIn ? (
                                <Link
                                    href="/customer/dashboard"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-200 transition-all hover:scale-105"
                                >
                                    <User size={18} />
                                    {customerName}
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-200 transition-all hover:scale-105"
                                >
                                    <User size={18} />
                                    {t.login}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Search Bar */}
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-transparent focus:border-pink-300 focus:ring-4 focus:ring-pink-100 outline-none transition-all shadow-sm"
                        />
                        <button type="submit" className="absolute left-4 top-4 text-gray-400 group-focus-within:text-pink-600 transition-colors hover:text-pink-600 cursor-pointer">
                            <Search size={22} />
                        </button>
                    </form>
                </div>
            </header>

            <main className="p-4 space-y-8">
                {/* Categories Dropdown */}
                <section>
                    <div className="relative">
                        <button
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 font-bold text-gray-800 hover:shadow-xl transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <Package size={22} className="text-pink-600" />
                                {t.browseCategories}
                            </span>
                            {isCategoryDropdownOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                        </button>

                        {isCategoryDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 z-20 overflow-hidden animate-in fade-in zoom-in duration-300">
                                <div className="grid grid-cols-2 gap-2 p-2">
                                    {categories.map((cat) => (
                                        <Link
                                            href={`/customer/explore?category=${cat.name}`}
                                            key={cat.name}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={() => setIsCategoryDropdownOpen(false)}
                                        >
                                            <div className={`w-8 h-8 ${cat.color} rounded-lg flex items-center justify-center text-sm`}>
                                                {cat.icon}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                    <Link href="/customer/explore" className="text-pink-600 text-xs font-bold hover:underline">
                                        {t.viewAllCategories}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Top Trending Products */}
                {trendingProducts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg text-gray-800">{t.topTrendingProducts}</h2>
                            <Link href="/customer/explore?type=products" className="text-pink-600 text-sm font-medium">
                                {t.seeAll}
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                            {trendingProducts.map((product) => (
                                <Link key={product.id} href={`/customer/product/${product.id}`} className="block">
                                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50 min-w-[180px] w-[180px] group hover:shadow-xl hover:scale-105 transition-all duration-300 snap-start cursor-pointer">
                                        <div className="h-36 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl mb-3 overflow-hidden relative">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={40} className="text-pink-300" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                                                <span className="text-xs font-bold text-pink-600">₹{product.price}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{product.name}</h3>
                                        <button className="w-full mt-2 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-lg hover:shadow-md transition-all">
                                            View Details
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Top Trending Services */}
                {trendingServices.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg text-gray-800">{t.topTrendingServices}</h2>
                            <Link href="/customer/explore?type=services" className="text-pink-600 text-sm font-medium">
                                {t.seeAll}
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                            {trendingServices.map((service) => (
                                <div key={service.id} onClick={() => handleBookNow(service)} className="block cursor-pointer">
                                    <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 min-w-[220px] flex flex-col justify-between group hover:shadow-xl hover:scale-105 transition-all duration-300 snap-start">
                                        <div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-6 transition-transform">
                                                <Briefcase size={24} />
                                            </div>
                                            <h3 className="font-bold text-gray-800 mb-2">{service.name}</h3>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-4">{service.description || "Professional service available"}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                                ₹{service.price}
                                            </span>
                                            <span className="text-purple-600 hover:text-purple-700 font-bold text-sm transition-colors">
                                                Book →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Top Rated Entrepreneurs */}
                <section>
                    <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center gap-2">
                        <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Top Rated Women Entrepreneurs</span>
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {topEntrepreneurs.length > 0 ? topEntrepreneurs.map((entrepreneur) => (
                            <Link href={`/shop/${entrepreneur.id}`} key={entrepreneur.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50 min-w-[240px] flex items-center justify-between group hover:shadow-xl transition-all snap-start cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {entrepreneur.businessName?.charAt(0) || entrepreneur.name?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{entrepreneur.businessName || entrepreneur.name || "Unknown"}</h3>
                                        <p className="text-xs text-gray-600 font-medium">{entrepreneur.category || "General"}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full shadow-md">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-xs font-bold">{entrepreneur.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center w-full py-8 text-gray-500">
                                No reviews yet. Be the first to review!
                            </div>
                        )}
                    </div>
                </section>

                {/* Safety Badges */}
                <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200 flex items-center gap-4 shadow-lg">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Verified & Safe</h3>
                        <p className="text-sm text-gray-600">All entrepreneurs are verified for your safety and trust.</p>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-20">
                <Link href="/customer" className="flex flex-col items-center gap-1 text-pink-600">
                    <Home size={24} />
                    <span className="text-[10px] font-medium">{t.home}</span>
                </Link>
                <Link href="/customer/explore" className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-600">
                    <Search size={24} />
                    <span className="text-[10px] font-medium">{t.explore}</span>
                </Link>
                <Link href="/customer/cart" className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-600">
                    <ShoppingCart size={24} />
                    <span className="text-[10px] font-medium">{t.cart}</span>
                </Link>
                <Link href="/customer/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-600">
                    <Package size={24} />
                    <span className="text-[10px] font-medium">{t.orders}</span>
                </Link>
                <Link href="/customer/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-600">
                    <User size={24} />
                    <span className="text-[10px] font-medium">{t.account}</span>
                </Link>
            </div>

            {/* Login/Signup Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {isSignup ? t.createAccount : t.login}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsSignup(false);
                                        setError("");
                                        setFormData({ username: "", password: "", name: "", phone: "" });
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                                {isSignup && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                                placeholder={t.enterName}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneNumber}</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                maxLength={10}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                                placeholder={t.enterPhone}
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                        placeholder={t.enterUsername}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                        placeholder={t.enterPassword}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 disabled:opacity-50"
                                >
                                    {loading ? t.pleaseWait : isSignup ? t.createAccount : t.login}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsSignup(!isSignup);
                                        setError("");
                                        setFormData({ username: "", password: "", name: "", phone: "" });
                                    }}
                                    className="text-pink-600 font-medium hover:underline"
                                >
                                    {isSignup ? t.alreadyHaveAccount : t.createNewAccount}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {isBookingModalOpen && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">{t.bookService}</h2>
                                <button
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{selectedService.name}</h3>
                                        <p className="text-pink-600 font-bold">₹{selectedService.price}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    {selectedService.description || "No description available."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.selectDate}</label>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.selectTimeSlot}</label>
                                    {bookingLoading ? (
                                        <div className="text-sm text-gray-500 text-center py-4">Loading slots...</div>
                                    ) : availabilityMessage ? (
                                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                            {availabilityMessage}
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map((slot, index) => {
                                                const slotTime = `${slot.startTime} - ${slot.endTime}`;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setBookingTime(slotTime)}
                                                        className={`py-2 px-1 text-xs font-medium rounded-lg border transition-colors ${bookingTime === slotTime
                                                            ? "bg-pink-600 text-white border-pink-600"
                                                            : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                                                            }`}
                                                    >
                                                        {slot.startTime}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : bookingDate ? (
                                        <div className="text-sm text-gray-500 text-center py-4">
                                            Please select a date first
                                        </div>
                                    ) : null}
                                </div>

                                {/* Location Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.location}</label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={bookingLocation}
                                            onChange={(e) => setBookingLocation(e.target.value)}
                                            placeholder={t.enterAddress}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.paymentMethod}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod("upi")}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${paymentMethod === "upi"
                                                ? "bg-pink-50 border-pink-500 text-pink-700"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-pink-200"
                                                }`}
                                        >
                                            <CreditCard size={18} />
                                            UPI / Online
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("cash")}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${paymentMethod === "cash"
                                                ? "bg-pink-50 border-pink-500 text-pink-700"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-pink-200"
                                                }`}
                                        >
                                            <DollarSign size={18} />
                                            {t.cashAfterWork}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={confirmBooking}
                                    disabled={bookingLoading || !bookingDate || !bookingTime || !bookingLocation}
                                    className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 disabled:opacity-50 mt-4"
                                >
                                    {bookingLoading ? t.processing : t.confirmBooking}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
