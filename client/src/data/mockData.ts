export const mockFeed = [
  {
    id: "post-1",
    type: "housing",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      verified: true
    },
    timeAgo: "2h ago",
    content: "Beautiful 2BR apartment just listed in Westlands! Perfect for young professionals. High-speed internet included.",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800&h=500"],
    price: "KSh 65,000 / mo",
    location: "Westlands, Nairobi",
    stats: { likes: 124, comments: 18, shares: 5 }
  },
  {
    id: "post-2",
    type: "budget-bite",
    author: {
      name: "Chef Kama",
      avatar: "https://i.pravatar.cc/150?u=kama",
      verified: false
    },
    timeAgo: "4h ago",
    content: "Just whipped up this amazing Swahili Pilau for under KSh 500! Feeds 4 people. Who wants the recipe?",
    images: ["https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800&h=500"],
    price: "KSh 450",
    tags: ["Homemade", "Under 500", "Dinner"],
    stats: { likes: 342, comments: 56, shares: 89 }
  },
  {
    id: "ad-1",
    type: "sponsored",
    author: {
      name: "Safaricom",
      avatar: "https://i.pravatar.cc/150?u=safaricom",
      verified: true
    },
    timeAgo: "Sponsored",
    content: "Get 5G Home Internet today. Fast, reliable, and affordable. Switch now and get your first month at 50% off!",
    images: ["https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800&h=300"],
    actionText: "Learn More",
    stats: { likes: 89, comments: 2, shares: 1 }
  },
  {
    id: "post-3",
    type: "marketplace",
    author: {
      name: "Tech Hub KE",
      avatar: "https://i.pravatar.cc/150?u=techhub",
      verified: true
    },
    timeAgo: "5h ago",
    content: "Slightly used MacBook Pro M1 2020. Battery health 95%. Comes with original charger and box.",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800&h=500"],
    price: "KSh 120,000",
    location: "CBD, Nairobi",
    stats: { likes: 45, comments: 12, shares: 3 }
  }
];

export const mockRecipes = [
  {
    id: "r1",
    name: "Ugali Njeri (Githeri)",
    cost: 350,
    time: "45 mins",
    type: "Homemade",
    image: "https://images.unsplash.com/photo-1604152006599-47f52636a086?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    id: "r2",
    name: "Campus Special: Eggs & Sukuma",
    cost: 150,
    time: "15 mins",
    type: "Homemade",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400&h=300"
  },
  {
    id: "r3",
    name: "Kibanda Chips Mayai",
    cost: 200,
    time: "10 mins",
    type: "Vendor",
    vendor: "Mama Ntilie's",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=400&h=300"
  }
];