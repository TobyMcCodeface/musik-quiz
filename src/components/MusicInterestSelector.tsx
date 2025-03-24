"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MusicInterestSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
}

export default function MusicInterestSelector({ selectedInterests, onChange }: MusicInterestSelectorProps) {
  const musicGenres = [
    "Pop",
    "Rock",
    "Hip Hop",
    "R&B",
    "Jazz",
    "Classical",
    "Electronic",
    "Country",
    "Folk",
    "Metal",
    "Blues",
    "Reggae",
    "K-Pop",
    "Latin",
  ]
  
  const toggleInterest = (genre: string) => {
    onChange(
      selectedInterests.includes(genre) 
        ? selectedInterests.filter((item) => item !== genre) 
        : [...selectedInterests, genre]
    );
  }
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">
        Välj dina musikintressen
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {musicGenres.map((genre) => (
          <Button
            key={genre}
            variant={selectedInterests.includes(genre) ? "default" : "outline"}
            className={`rounded-full transition-all text-xs px-3 py-1 h-auto ${
              selectedInterests.includes(genre) ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-primary/10"
            }`}
            onClick={() => toggleInterest(genre)}
            type="button"
          >
            {genre}
          </Button>
        ))}
      </div>
      {selectedInterests.length > 0 && (
        <div className="mt-1">
          <p className="text-xs text-gray-500">Valda intressen ({selectedInterests.length}): {selectedInterests.join(", ")}</p>
        </div>
      )}
    </div>
  )
}