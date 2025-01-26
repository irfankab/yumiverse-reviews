import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Restaurant = Tables<"restaurants">;
type Review = Tables<"reviews"> & {
  profiles: Tables<"profiles">;
};

const Index = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
    fetchLatestReviews();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive",
      });
    }
  };

  const fetchLatestReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setLatestReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Find Your Next Favorite Spot</h1>
          <p className="text-xl opacity-90">
            Discover and share the best restaurants in your area
          </p>
        </div>
      </div>

      {/* Featured Restaurants */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            >
              <CardHeader>
                <CardTitle>{restaurant.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine_type}</p>
                <p className="text-sm text-gray-500">{restaurant.address}</p>
                {restaurant.price_range && (
                  <p className="text-sm text-gray-600 mt-2">
                    Price Range: {restaurant.price_range}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Latest Reviews */}
      <div className="container mx-auto px-4 py-12 bg-white">
        <h2 className="text-3xl font-bold mb-8">Latest Reviews</h2>
        <div className="space-y-6">
          {latestReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {review.profiles?.username || "Anonymous"}
                      </span>
                      <span className="text-yellow-500">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={`${supabase.storage.from("review_images").getPublicUrl(image).data.publicUrl}`}
                            alt={`Review image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;