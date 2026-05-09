"use client";

import { useEffect, useState } from "react";

interface PetTopic {
  topic: string;
  score: number;
  pet_angle: string;
  priority: string;
}

export function PetTopicsWidget() {
  const [topics, setTopics] = useState<PetTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/insights/opportunities?site=fursbliss&limit=5")
      .then((r) => r.json())
      .then((data) => {
        setTopics(data.opportunities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading trending topics...</div>;
  if (topics.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-orange-900/40 to-black rounded-xl border border-orange-500/20 p-8 my-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🐾</span> Trending Pet Topics
      </h2>
      <div className="space-y-3">
        {topics.map((topic, i) => (
          <div key={i} className="group">
            <div className="flex items-start justify-between p-3 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition">
              <div>
                <p className="font-semibold text-white">{topic.topic}</p>
                <p className="text-sm text-orange-300 mt-1">
                  💡 {topic.pet_angle}
                </p>
              </div>
              <div className="text-xs font-medium">
                <span className={`px-2 py-1 rounded ${
                  topic.priority === "high" ? "bg-red-500/20 text-red-300" :
                  topic.priority === "medium" ? "bg-yellow-500/20 text-yellow-300" :
                  "bg-green-500/20 text-green-300"
                }`}>
                  {topic.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-6">What pet owners are asking about right now</p>
    </div>
  );
}
