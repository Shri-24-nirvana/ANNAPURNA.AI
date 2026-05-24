"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Calendar, Download, FileText, Eye } from "lucide-react";
import { useState } from "react";

interface MealDetails {
  type: "Breakfast" | "Lunch" | "Dinner";
  image: string;
  dishes: string[];
  nutritionalData: {
    calories: number;
    protein: string;
    fats: string;
    carbs: string;
  };
}

interface DayMenu {
  day: string;
  date: string;
  meals: MealDetails[];
}

const WEEKLY_MENU: DayMenu[] = [
  {
    day: "MONDAY",
    date: "Oct 26",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Aloo Paratha (2 pcs)", "Chilled Thick Curd", "Mixed Pickle", "Hot Cardamom Tea"],
        nutritionalData: { calories: 380, protein: "10g", fats: "12g", carbs: "54g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Paneer Tikka Masala", "Fragrant Jeera Rice", "Yellow Dal Tadka", "Butter Naan (1 pc)"],
        nutritionalData: { calories: 620, protein: "24g", fats: "20g", carbs: "72g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Homestyle Chicken Curry", "Steamed Basmati Rice", "Tandoori Roti (2 pcs)", "Fresh Cucumber Salad"],
        nutritionalData: { calories: 550, protein: "32g", fats: "16g", carbs: "58g" }
      }
    ]
  },
  {
    day: "TUESDAY",
    date: "Oct 27",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Steamed Idli (3 pcs)", "Hot Sambhar", "Coconut & Tomato Chutney", "Filter Coffee"],
        nutritionalData: { calories: 310, protein: "8g", fats: "4g", carbs: "58g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Shahi Veg Pulao", "Mixed Vegetable Kurma", "Boondi Raita", "Roasted Papad"],
        nutritionalData: { calories: 480, protein: "12g", fats: "10g", carbs: "68g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Egg Masala Curry (2 eggs)", "Arhar Dal Fry", "Phulka Roti (3 pcs)", "Sliced Carrots & Onions"],
        nutritionalData: { calories: 510, protein: "22g", fats: "14g", carbs: "62g" }
      }
    ]
  },
  {
    day: "WEDNESDAY",
    date: "Oct 28",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Kanda Poha with Sev", "Crispy Jalebi (2 pcs)", "Roasted Peanuts", "Ginger Tea"],
        nutritionalData: { calories: 350, protein: "7g", fats: "9g", carbs: "56g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Punjabi Rajma Masala", "Steamed Basmati Rice", "Dry Aloo Jeera", "Butter Milk (Chass)"],
        nutritionalData: { calories: 540, protein: "18g", fats: "12g", carbs: "78g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Paneer Bhurji", "Soft Rumali Roti (2 pcs)", "Dal Palak", "Mixed Onion Salad"],
        nutritionalData: { calories: 580, protein: "21g", fats: "17g", carbs: "63g" }
      }
    ]
  },
  {
    day: "THURSDAY",
    date: "Oct 29",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Amritsari Chole Bhature (2 pcs)", "Pickled Green Chilies", "Sweet Punjabi Lassi"],
        nutritionalData: { calories: 610, protein: "15g", fats: "24g", carbs: "76g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Kadhai Paneer Masala", "Yellow Moong Dal Tadka", "Tandoori Roti (2 pcs)", "Jeera Rice"],
        nutritionalData: { calories: 590, protein: "22g", fats: "18g", carbs: "69g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Bengali Fish Curry (or Mushroom Gravy)", "Steamed Rice", "Lemon Slices", "Crispy Papad"],
        nutritionalData: { calories: 490, protein: "29g", fats: "13g", carbs: "57g" }
      }
    ]
  },
  {
    day: "FRIDAY",
    date: "Oct 30",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Masala Bread Omlette (or Veg Club Sandwich)", "Tomato Ketchup", "Fresh Orange Juice"],
        nutritionalData: { calories: 340, protein: "13g", fats: "11g", carbs: "44g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Veg Biryani with Saffron", "Rich Paneer Gravy", "Mixed Veg Raita", "Sweet Gulab Jamun (1 pc)"],
        nutritionalData: { calories: 680, protein: "20g", fats: "22g", carbs: "88g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Dhabha Style Mutton Curry (or Kadhai Chaap)", "Butter Roti (3 pcs)", "Cucumber Raita", "Sirka Onion Salad"],
        nutritionalData: { calories: 650, protein: "33g", fats: "22g", carbs: "62g" }
      }
    ]
  },
  {
    day: "SATURDAY",
    date: "Oct 31",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Hot Puri (4 pcs) with Aloo Rasedar", "Classic Suji Halwa", "Hot Ginger Tea"],
        nutritionalData: { calories: 520, protein: "10g", fats: "18g", carbs: "72g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Pindi Chana Masala", "Soft Fluffy Bhatura (1 pc)", "Steamed Jeera Rice", "Garlic Pickle"],
        nutritionalData: { calories: 550, protein: "15g", fats: "14g", carbs: "78g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Schezwan Chili Paneer Gravy", "Veg Fried Rice", "Crispy Spring Roll (2 pcs)", "Cabbage Salad"],
        nutritionalData: { calories: 610, protein: "17g", fats: "19g", carbs: "84g" }
      }
    ]
  },
  {
    day: "SUNDAY",
    date: "Nov 01",
    meals: [
      {
        type: "Breakfast",
        image: "/breakfast_dish.png",
        dishes: ["Crispy Masala Dosa", "Medu Vada (1 pc)", "Coconut Chutney & Sambhar", "Hot Tea"],
        nutritionalData: { calories: 410, protein: "11g", fats: "10g", carbs: "64g" }
      },
      {
        type: "Lunch",
        image: "/lunch_dish.png",
        dishes: ["Special Sunday Veg Dum Biryani", "Mirchi Ka Salan", "Onion Raita", "Mango Lassi"],
        nutritionalData: { calories: 720, protein: "18g", fats: "24g", carbs: "96g" }
      },
      {
        type: "Dinner",
        image: "/dinner_dish.png",
        dishes: ["Light Moong Dal Khichdi", "Desi Ghee", "Roasted Papad", "Aloo Chokha & Tomato Chutney"],
        nutritionalData: { calories: 340, protein: "10g", fats: "8g", carbs: "54g" }
      }
    ]
  }
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [expandedDay, setExpandedDay] = useState<string>("MONDAY");
  const [expandedMeal, setExpandedMeal] = useState<string>("MONDAY-Lunch");

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayOffset = 3; // Oct 1, 2026 is a Thursday (0: Mon, 1: Tue, 2: Wed, 3: Thu...)

  return (
    <div className="bg-slate-50 min-h-full pb-12">
      
      {/* Top Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6 shadow-sm">
        <button 
          onClick={() => setActiveTab("weekly")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "weekly" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Weekly Menu
        </button>
        <button 
          onClick={() => setActiveTab("monthly")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "monthly" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Monthly Menu
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {activeTab === "weekly" ? (
          <>
            <h2 className="text-sm font-bold text-slate-700 text-center mb-6 tracking-wide bg-white py-2.5 px-4 rounded-xl border border-slate-200/60 shadow-sm inline-block mx-auto w-full max-w-xs">
              📅 Oct 26 - Nov 01, 2026
            </h2>

            <div className="space-y-4">
              {WEEKLY_MENU.map((dayData) => {
                const isDayExpanded = expandedDay === dayData.day;
                return (
                  <Card key={dayData.day} className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <div 
                      className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isDayExpanded ? 'bg-slate-50/70 border-b border-slate-100' : 'hover:bg-slate-50/50'}`}
                      onClick={() => setExpandedDay(isDayExpanded ? "" : dayData.day)}
                    >
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">{dayData.day}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{dayData.date}</p>
                      </div>
                      {isDayExpanded ? <ChevronUp className="h-5 w-5 text-slate-400"/> : <ChevronDown className="h-5 w-5 text-slate-400"/>}
                    </div>
                    
                    {isDayExpanded && (
                      <div className="p-4 bg-white space-y-3">
                        {dayData.meals.map((meal) => {
                          const isMealExpanded = expandedMeal === `${dayData.day}-${meal.type}`;
                          return (
                            <div key={meal.type} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                              <div 
                                className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${isMealExpanded ? 'bg-slate-100/60' : 'bg-slate-50/50 hover:bg-slate-50'}`}
                                onClick={() => setExpandedMeal(isMealExpanded ? "" : `${dayData.day}-${meal.type}`)}
                              >
                                <h4 className="font-extrabold text-slate-700 text-xs tracking-wider uppercase">{meal.type}</h4>
                                {isMealExpanded ? <ChevronUp className="h-4 w-4 text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400"/>}
                              </div>
                              
                              {isMealExpanded && (
                                <div className="p-4 space-y-4 animate-in fade-in-30 slide-in-from-top-1 duration-200">
                                  {/* Food Image */}
                                  <div className="h-40 w-full relative rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                                    <img 
                                      src={meal.image} 
                                      alt={meal.type} 
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3.5">
                                      <span className="bg-[#4a7c82] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                        {meal.type} Option
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Items</p>
                                      <div className="space-y-1.5 pl-0.5">
                                        {meal.dishes.map((dish, i) => (
                                          <p key={i} className="text-xs font-bold text-slate-800 flex items-start gap-2">
                                            <span className="text-[#4a7c82] font-black">{i + 1}.</span> 
                                            <span className="font-medium text-slate-600">{dish}</span>
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div className="w-full sm:w-[150px] bg-slate-50/80 rounded-xl p-3.5 border border-slate-150 flex flex-col justify-center shadow-inner">
                                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2.5 tracking-widest text-center">Nutritional Info</p>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Cal:
                                          </span>
                                          <span className="text-[10px] font-black text-slate-800">{meal.nutritionalData.calories}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Prot:
                                          </span>
                                          <span className="text-[10px] font-black text-slate-800">{meal.nutritionalData.protein}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Fats:
                                          </span>
                                          <span className="text-[10px] font-black text-slate-800">{meal.nutritionalData.fats}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Carbs:
                                          </span>
                                          <span className="text-[10px] font-black text-slate-800">{meal.nutritionalData.carbs}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Monthly Header and Download Actions */}
            <Card className="border border-slate-200/60 shadow-md rounded-2xl overflow-hidden bg-white p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#4a7c82]/10 text-[#4a7c82] rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">Monthly Menu - October 2026</h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Example Tech University Mess Schedule</p>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <a 
                    href="/monthly_menu.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/50 shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </a>
                  <a 
                    href="/monthly_menu.pdf" 
                    download="Annapurna_Monthly_Menu_Oct_2026.pdf"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#4a7c82] hover:bg-[#386065] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </a>
                </div>
              </div>
            </Card>

            {/* Calendar Widget */}
            <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white p-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">October 2026 Calendar</h4>
                <span className="text-[10px] font-bold text-[#4a7c82] bg-[#4a7c82]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Menu Plan Active
                </span>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, index) => (
                  <span key={index} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</span>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for padding before starting day */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 rounded-xl bg-slate-50/50"></div>
                ))}
                
                {/* Day Cells */}
                {calendarDays.map((day) => {
                  // highlight today's range (26 Oct is highlighted as example active)
                  const isCurrentWeek = day >= 26 && day <= 31;
                  return (
                    <div 
                      key={day} 
                      className={`h-10 flex flex-col justify-between p-1.5 rounded-xl border transition-all cursor-pointer relative group ${
                        isCurrentWeek 
                          ? "bg-[#4a7c82]/10 border-[#4a7c82] text-slate-900" 
                          : "bg-white border-slate-100 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] font-bold">{day}</span>
                      <div className="flex gap-0.5 justify-center mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                        <span className="w-1 h-1 rounded-full bg-yellow-500"></span>
                        <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                        {isCurrentWeek ? "Active Week - View details" : "October " + day}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4a7c82]/10 border border-[#4a7c82]"></span>
                  <span>Active Week Range</span>
                </div>
                <span>* Tap Weekly Menu tab to customize access tickets</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
