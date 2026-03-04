import AppLayout from "@/components/layout/AppLayout";
import { mockFeed } from "@/data/mockData";
import { Heart, MessageCircle, Share2, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Discover() {
  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Stories/Quick Updates Area (Optional feature for future) */}
        <div className="h-24 border-b border-border bg-card/50 flex items-center px-4 gap-4 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[64px]">
              <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5">
                <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-full h-full rounded-full object-cover" alt="User" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">User {i}</span>
            </div>
          ))}
        </div>

        {/* Feed Timeline */}
        <div className="flex flex-col gap-2 pb-6 bg-muted/30">
          {mockFeed.map((post) => (
            <article key={post.id} className="bg-card px-4 py-4 sm:rounded-none">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-sm">{post.author.name}</h3>
                      {post.author.verified && <span className="text-primary text-xs">✓</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.timeAgo} • {post.type}</p>
                  </div>
                </div>
                {post.type === "sponsored" && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">Ad</span>
                )}
              </div>

              {/* Post Content */}
              <p className="text-sm mb-3 leading-relaxed">{post.content}</p>

              {/* Post Tags/Meta */}
              <div className="flex flex-wrap gap-2 mb-3">
                {post.price && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {post.price}
                  </span>
                )}
                {post.location && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" /> {post.location}
                  </span>
                )}
                {post.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className="rounded-xl overflow-hidden mb-3 bg-muted aspect-[4/3]">
                  <img src={post.images[0]} alt="Post media" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Ad Action */}
              {post.type === "sponsored" && post.actionText && (
                <button className="w-full py-2.5 bg-primary/10 text-primary font-semibold rounded-lg mb-3 hover:bg-primary/20 transition-colors">
                  {post.actionText}
                </button>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center gap-6 pt-3 border-t border-border/50 text-muted-foreground">
                <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{post.stats.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.stats.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors ml-auto">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}