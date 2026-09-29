"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  Package,
  Wrench,
  FileText,
  Gavel,
  Users,
  MapPin,
  ShieldCheck,
  Star,
  Grid3X3,
  List,
  ArrowRight,
} from "lucide-react";

const MARKETPLACE_ITEMS = [
  {
    id: 1,
    name: "Industrial Automation PLC",
    description:
      "Advanced programmable logic controller for industrial automation.",
    price: 1299,
    category: "Automation",
    type: "Products",
    seller: "TechCore Industries",
    location: "Kigali",
    stock: 45,
    rating: 4.8,
    reviews: 127,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
  },

  {
    id: 2,
    name: "Industrial Electric Motor",
    description:
      "High-efficiency motor for factories and manufacturing plants.",
    price: 2500,
    category: "Industrial",
    type: "Products",
    seller: "PowerTech Ltd",
    location: "Kigali",
    stock: 20,
    rating: 4.6,
    reviews: 54,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
  },

  {
    id: 3,
    name: "Commercial Solar Panels",
    description:
      "Solar panels and renewable energy equipment for businesses.",
    price: 800,
    category: "Electrical",
    type: "Products",
    seller: "Green Energy Corp",
    location: "Huye",
    stock: 100,
    rating: 4.9,
    reviews: 80,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
  },

  {
    id: 4,
    name: "Machine Installation",
    description:
      "Professional industrial equipment installation and maintenance.",
    price: 500,
    category: "Industrial",
    type: "Services",
    seller: "Power Solutions",
    location: "Kigali",
    stock: 1,
    rating: 4.9,
    reviews: 90,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df2d?w=800",
  },

  {
    id: 5,
    name: "Warehouse Logistics Service",
    description:
      "Business logistics, storage and inventory handling services.",
    price: 350,
    category: "Logistics",
    type: "Services",
    seller: "FastMove Logistics",
    location: "Kigali",
    stock: 1,
    rating: 4.7,
    reviews: 64,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
  },

  {
    id: 6,
    name: "Smart Sensor System RFQ",
    description:
      "Request for quotation for IoT monitoring sensors.",
    price: 0,
    category: "IoT",
    type: "RFQs",
    seller: "Sensor Labs",
    location: "Kigali",
    stock: 1,
    rating: 4.7,
    reviews: 120,
    verified: false,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
  },

  {
    id: 7,
    name: "Bulk Rice Supply RFQ",
    description:
      "Business request for 500 bags of quality rice.",
    price: 0,
    category: "Agriculture",
    type: "RFQs",
    seller: "Kigali Wholesale",
    location: "Kigali",
    stock: 1,
    rating: 4.6,
    reviews: 38,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
  },

  {
    id: 8,
    name: "Industrial Robot Auction",
    description:
      "6-axis manufacturing robot available through business bidding.",
    price: 8000,
    category: "Robotics",
    type: "Auctions",
    seller: "Robot Works",
    location: "Kigali",
    stock: 1,
    rating: 4.8,
    reviews: 60,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
  },

  {
    id: 9,
    name: "Forklift Equipment Auction",
    description:
      "Used industrial forklift available for competitive bidding.",
    price: 6500,
    category: "Industrial",
    type: "Auctions",
    seller: "Industrial Hub",
    location: "Musanze",
    stock: 1,
    rating: 4.7,
    reviews: 44,
    verified: true,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800",
  },
];

const MARKETPLACE_TABS = [
  {
    id: "Products",
    label: "Products",
    description: "Buy and sell inventory",
    icon: Package,
  },

  {
    id: "Services",
    label: "Services",
    description: "Business services",
    icon: Wrench,
  },

  {
    id: "RFQs",
    label: "RFQs",
    description: "Business requests",
    icon: FileText,
  },

  {
    id: "Auctions",
    label: "Auctions",
    description: "Competitive bidding",
    icon: Gavel,
  },
];

const CATEGORIES = [
  "All Categories",
  "Agriculture",
  "Automation",
  "Electrical",
  "Industrial",
  "IoT",
  "Logistics",
  "Robotics",
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("Products");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesTab = item.type === activeTab;

    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" ||
      item.category === category;

    return matchesTab && matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between">

            <Link href="/" className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-xl">
                S
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  StockBridge
                </h1>

                <p className="text-xs text-gray-500">
                  B2B Inventory Network
                </p>
              </div>

            </Link>


            <div className="hidden md:flex items-center gap-8">

              <Link
                href="/"
                className="text-gray-600 hover:text-green-600"
              >
                Home
              </Link>

              <Link
                href="/marketplace"
                className="font-semibold text-green-600"
              >
                Marketplace
              </Link>

              <Link
                href="/#features"
                className="text-gray-600 hover:text-green-600"
              >
                Features
              </Link>

              <Link
                href="/#about"
                className="text-gray-600 hover:text-green-600"
              >
                About
              </Link>

            </div>


            <div className="flex items-center gap-3">

              <button className="hidden sm:block px-4 py-2 text-gray-700">
                Login
              </button>

              <Link
                href="/"
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700"
              >
                Join StockBridge
              </Link>

            </div>

          </div>

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="max-w-3xl">

            <span className="text-green-600 font-bold text-sm">
              STOCKBRIDGE MARKETPLACE
            </span>

            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mt-3 leading-tight">
              Find what your business
              <span className="text-green-600">
                {" "}needs.
              </span>
            </h2>

            <p className="text-lg text-gray-600 mt-5">
              Connect with businesses that have the inventory,
              services and opportunities your business needs.
            </p>

          </div>


          {/* SEARCH */}

          <div className="mt-10 bg-white border shadow-lg rounded-2xl p-3">

            <div className="flex flex-col md:flex-row gap-3">

              <div className="relative flex-1">

                <Search
                  size={21}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, suppliers, services..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>


              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-5 py-4 rounded-xl border border-gray-200 outline-none"
              >

                {CATEGORIES.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

      </section>


      {/* ================= MARKETPLACE TYPES ================= */}

      <section className="max-w-7xl mx-auto px-6 pt-10">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {MARKETPLACE_TABS.map((tab) => {

            const Icon = tab.icon;

            return (

              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left p-5 rounded-2xl border transition ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white border-green-600 shadow-lg"
                    : "bg-white text-slate-900 border-gray-200 hover:border-green-400 hover:shadow-md"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      activeTab === tab.id
                        ? "bg-white/20"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <ArrowRight size={18} />

                </div>


                <h3 className="font-bold text-lg mt-4">
                  {tab.label}
                </h3>

                <p
                  className={`text-sm mt-1 ${
                    activeTab === tab.id
                      ? "text-green-100"
                      : "text-gray-500"
                  }`}
                >
                  {tab.description}
                </p>

              </button>

            );
          })}

        </div>

      </section>


      {/* ================= MARKETPLACE CONTENT ================= */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab}
            </h2>

            <p className="text-gray-500 mt-1">
              {filteredItems.length} listings available
            </p>

          </div>


          <div className="flex items-center gap-3">

            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 border rounded-xl bg-white hover:bg-gray-50"
            >
              <Users size={18} />
              Find Suppliers
            </Link>


            <div className="flex border rounded-xl overflow-hidden bg-white">

              <button
                onClick={() => setView("grid")}
                className={`p-3 ${
                  view === "grid"
                    ? "bg-green-600 text-white"
                    : "text-gray-500"
                }`}
              >
                <Grid3X3 size={18} />
              </button>

              <button
                onClick={() => setView("list")}
                className={`p-3 ${
                  view === "list"
                    ? "bg-green-600 text-white"
                    : "text-gray-500"
                }`}
              >
                <List size={18} />
              </button>

            </div>

          </div>

        </div>


        {/* ================= LISTINGS ================= */}

        {filteredItems.length > 0 ? (

          <div
            className={
              view === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
                : "space-y-5 mt-6"
            }
          >

            {filteredItems.map((item) => (

              <article
                key={item.id}
                className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition ${
                  view === "list"
                    ? "md:flex"
                    : ""
                }`}
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className={
                    view === "list"
                      ? "w-full md:w-64 h-56 object-cover"
                      : "w-full h-52 object-cover"
                  }
                />


                <div className="p-5 flex-1">

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <span className="text-xs font-semibold text-green-600 uppercase">
                        {item.category}
                      </span>

                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {item.name}
                      </h3>

                    </div>


                    {item.verified && (

                      <ShieldCheck
                        size={21}
                        className="text-green-600 shrink-0"
                      />

                    )}

                  </div>


                  <p className="text-gray-600 text-sm mt-3 leading-6">
                    {item.description}
                  </p>


                  <div className="flex items-center gap-1 mt-4">

                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold">
                      {item.rating}
                    </span>

                    <span className="text-gray-400 text-sm">
                      ({item.reviews} reviews)
                    </span>

                  </div>


                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">

                    <MapPin size={16} />

                    {item.location}

                  </div>


                  <div className="border-t mt-5 pt-5">

                    <p className="text-xs text-gray-400">
                      Listed by
                    </p>

                    <p className="font-semibold text-slate-800">
                      {item.seller}
                    </p>

                  </div>


                  <div className="flex items-end justify-between mt-5">

                    <div>

                      {item.type === "RFQs" ? (

                        <p className="text-lg font-bold text-green-600">
                          Request for Quote
                        </p>

                      ) : (

                        <p className="text-2xl font-bold text-green-600">
                          ${item.price.toLocaleString()}
                        </p>

                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        {item.type === "Auctions"
                          ? "Starting bid"
                          : item.type === "Services"
                          ? "Service price"
                          : `Stock: ${item.stock}`}
                      </p>

                    </div>


                    <button className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700">

                      {item.type === "Products" && "Request"}

                      {item.type === "Services" && "Contact"}

                      {item.type === "RFQs" && "View RFQ"}

                      {item.type === "Auctions" && "Place Bid"}

                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="bg-white border rounded-2xl text-center py-20 mt-6">

            <div className="text-5xl">
              🔎
            </div>

            <h3 className="text-2xl font-bold mt-4">
              No {activeTab.toLowerCase()} found
            </h3>

            <p className="text-gray-500 mt-2">
              Try another search or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All Categories");
              }}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Clear Search
            </button>

          </div>

        )}

      </section>


      {/* ================= SUPPLIER CTA ================= */}

      <section className="bg-green-700 text-white mt-12">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="max-w-3xl">

            <span className="text-green-200 font-semibold">
              FOR BUSINESSES
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Have extra inventory?
            </h2>

            <p className="text-green-100 mt-4 text-lg">
              Turn unused inventory into business opportunities by
              connecting with companies that need your products.
            </p>

            <Link
              href="/"
              className="inline-block mt-7 bg-white text-green-700 px-7 py-3 rounded-xl font-bold hover:bg-gray-100"
            >
              List Your Inventory
            </Link>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 text-gray-400">

        <div className="max-w-7xl mx-auto px-6 py-10">

          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>

              <h2 className="text-white text-xl font-bold">
                StockBridge
              </h2>

              <p className="mt-2 text-sm">
                Business-to-business inventory sharing network.
              </p>

            </div>


            <div className="flex gap-6 text-sm">

              <Link
                href="/"
                className="hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/marketplace"
                className="hover:text-white"
              >
                Marketplace
              </Link>

              <Link
                href="/#features"
                className="hover:text-white"
              >
                Features
              </Link>

            </div>

          </div>


          <div className="border-t border-gray-800 mt-8 pt-6 text-sm">
            © 2026 StockBridge. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}