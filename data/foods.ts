export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    defaultUnit: string;
    gramsPerUnit: number;
    gramsPerPiece?: number; // For "adet" support (e.g., 1 grape = 5g)
}

export const FOODS: FoodItem[] = [
    // Kahvaltılık (ALL VALUES PER 100g)
    { name: "Yumurta", calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1, defaultUnit: "adet", gramsPerUnit: 50 },
    { name: "Haşlanmış Yumurta", calories: 155, protein: 13, carbs: 1.1, fat: 11, sugar: 1.1, defaultUnit: "adet", gramsPerUnit: 50 },
    { name: "Menemen", calories: 120, protein: 6, carbs: 5, fat: 9, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Omlet", calories: 154, protein: 11, carbs: 1.5, fat: 12, sugar: 1, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Yulaf", calories: 389, protein: 17, carbs: 66, fat: 7, sugar: 1, defaultUnit: "porsiyon", gramsPerUnit: 40 },
    { name: "Yulaf Ezmesi", calories: 389, protein: 17, carbs: 66, fat: 7, sugar: 1, defaultUnit: "gram", gramsPerUnit: 20 },
    { name: "Peynir", calories: 264, protein: 18, carbs: 1.3, fat: 21, sugar: 1, defaultUnit: "dilim", gramsPerUnit: 30 },
    { name: "Beyaz Peynir", calories: 250, protein: 17, carbs: 2, fat: 20, sugar: 1.5, defaultUnit: "dilim", gramsPerUnit: 30 },
    { name: "Kaşar Peyniri", calories: 330, protein: 23, carbs: 0, fat: 27, sugar: 0, defaultUnit: "dilim", gramsPerUnit: 30 },
    { name: "Zeytin", calories: 115, protein: 0.8, carbs: 6, fat: 11, sugar: 0, defaultUnit: "adet", gramsPerUnit: 10 },
    { name: "Siyah Zeytin", calories: 115, protein: 0.8, carbs: 6, fat: 11, sugar: 0, defaultUnit: "adet", gramsPerUnit: 10 },
    { name: "Yeşil Zeytin", calories: 145, protein: 1, carbs: 4, fat: 15, sugar: 0, defaultUnit: "adet", gramsPerUnit: 10 },
    { name: "Domates", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, sugar: 2.6, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Salatalık", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, sugar: 1.7, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Reçel", calories: 250, protein: 0.4, carbs: 65, fat: 0.1, sugar: 60, defaultUnit: "porsiyon", gramsPerUnit: 20 },
    { name: "Bal", calories: 304, protein: 0.3, carbs: 82, fat: 0, sugar: 82, defaultUnit: "porsiyon", gramsPerUnit: 20 },
    { name: "Tahin", calories: 595, protein: 18, carbs: 13, fat: 54, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 20 },
    { name: "Pekmez", calories: 260, protein: 2, carbs: 67, fat: 0, sugar: 60, defaultUnit: "porsiyon", gramsPerUnit: 20 },
    { name: "Tereyağı", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, sugar: 0.1, defaultUnit: "porsiyon", gramsPerUnit: 10 },
    { name: "Margarin", calories: 720, protein: 0.2, carbs: 0.4, fat: 81, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 10 },
    { name: "Süt", calories: 42, protein: 3.4, carbs: 5, fat: 1, sugar: 5, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Yoğurt", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, sugar: 4.7, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Ayran", calories: 30, protein: 1.5, carbs: 2, fat: 1.5, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 200 },
    { name: "Ekmek", calories: 265, protein: 9, carbs: 49, fat: 3.2, sugar: 5, defaultUnit: "dilim", gramsPerUnit: 40 },
    { name: "Kepekli Ekmek", calories: 247, protein: 11, carbs: 41, fat: 3.5, sugar: 3, defaultUnit: "dilim", gramsPerUnit: 40 },
    { name: "Tam Buğday Ekmeği", calories: 247, protein: 13, carbs: 41, fat: 3.4, sugar: 6, defaultUnit: "dilim", gramsPerUnit: 40 },
    { name: "Simit", calories: 280, protein: 9, carbs: 54, fat: 3, sugar: 2, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Poğaça", calories: 363, protein: 9, carbs: 50, fat: 15, sugar: 4, defaultUnit: "adet", gramsPerUnit: 80 },
    { name: "Börek", calories: 267, protein: 8, carbs: 29, fat: 13, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 120 },


    // Proteinler
    { name: "Tavuk", calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Tavuk Göğsü", calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, defaultUnit: "gram", gramsPerUnit: 100 },
    { name: "Izgara Tavuk", calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Haşlanmış Tavuk", calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Tavuk But", calories: 209, protein: 26, carbs: 0, fat: 11, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Dana Eti", calories: 250, protein: 26, carbs: 0, fat: 15, sugar: 0, defaultUnit: "gram", gramsPerUnit: 100 },
    { name: "Kuzu Eti", calories: 294, protein: 25, carbs: 0, fat: 21, sugar: 0, defaultUnit: "gram", gramsPerUnit: 100 },
    { name: "Köfte", calories: 260, protein: 18, carbs: 12, fat: 15, sugar: 2, defaultUnit: "adet", gramsPerUnit: 80 },
    { name: "Balık", calories: 206, protein: 22, carbs: 0, fat: 12, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Ton Balığı", calories: 130, protein: 30, carbs: 0, fat: 0.6, sugar: 0, defaultUnit: "gram", gramsPerUnit: 100 },
    { name: "Somon", calories: 208, protein: 20, carbs: 0, fat: 13, sugar: 0, defaultUnit: "gram", gramsPerUnit: 100 },
    { name: "Levrek", calories: 97, protein: 18, carbs: 0, fat: 2.5, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Çipura", calories: 115, protein: 19, carbs: 0, fat: 4, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 150 },

    // Karbonhidratlar
    { name: "Pilav", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, sugar: 0.1, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Makarna", calories: 131, protein: 5, carbs: 25, fat: 1.1, sugar: 0.8, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Bulgur Pilavı", calories: 83, protein: 3, carbs: 19, fat: 0.2, sugar: 0.1, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Patates", calories: 77, protein: 2, carbs: 17, fat: 0.1, sugar: 0.8, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Kızarmış Patates", calories: 312, protein: 3.4, carbs: 41, fat: 15, sugar: 0.3, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Patates Püresi", calories: 113, protein: 2, carbs: 16, fat: 4.2, sugar: 1.5, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Mercimek", calories: 116, protein: 9, carbs: 20, fat: 0.4, sugar: 1.8, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Nohut", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, sugar: 4.8, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Fasulye", calories: 127, protein: 8.7, carbs: 23, fat: 0.5, sugar: 0.3, defaultUnit: "porsiyon", gramsPerUnit: 100 },

    // Sebzeler
    { name: "Brokoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, sugar: 1.7, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Ispanak", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sugar: 0.4, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Karnabahar", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, sugar: 1.9, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Havuç", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, sugar: 4.7, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Kabak", calories: 17, protein: 1.2, carbs: 3.4, fat: 0.2, sugar: 2.5, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Patlıcan", calories: 25, protein: 1, carbs: 6, fat: 0.2, sugar: 3.5, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Biber", calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, sugar: 2.4, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Salata", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, sugar: 2.0, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Marul", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, sugar: 1.2, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Roka", calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 100 },

    // Meyveler
    { name: "Elma", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sugar: 10, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Muz", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, sugar: 12, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Portakal", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, sugar: 9, defaultUnit: "adet", gramsPerUnit: 130 },
    { name: "Mandalina", calories: 53, protein: 0.8, carbs: 13, fat: 0.3, sugar: 11, defaultUnit: "adet", gramsPerUnit: 90 },
    { name: "Çilek", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, sugar: 4.9, defaultUnit: "gram", gramsPerUnit: 100, gramsPerPiece: 12 },
    { name: "Üzüm", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, sugar: 16, defaultUnit: "gram", gramsPerUnit: 100, gramsPerPiece: 5 },
    { name: "Karpuz", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, sugar: 6.2, defaultUnit: "dilim", gramsPerUnit: 200 },
    { name: "Kavun", calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, sugar: 7.9, defaultUnit: "dilim", gramsPerUnit: 200 },
    { name: "Şeftali", calories: 39, protein: 0.9, carbs: 10, fat: 0.3, sugar: 8.4, defaultUnit: "adet", gramsPerUnit: 150 },
    { name: "Armut", calories: 57, protein: 0.4, carbs: 15, fat: 0.1, sugar: 10, defaultUnit: "adet", gramsPerUnit: 180 },
    { name: "Kayısı", calories: 48, protein: 1.4, carbs: 11, fat: 0.4, sugar: 9.2, defaultUnit: "adet", gramsPerUnit: 35 },
    { name: "Kiraz", calories: 63, protein: 1.1, carbs: 16, fat: 0.2, sugar: 13, defaultUnit: "gram", gramsPerUnit: 100, gramsPerPiece: 8 },
    { name: "Erik", calories: 46, protein: 0.7, carbs: 11, fat: 0.3, sugar: 10, defaultUnit: "adet", gramsPerUnit: 60 },
    { name: "İncir", calories: 74, protein: 0.8, carbs: 19, fat: 0.3, sugar: 16, defaultUnit: "adet", gramsPerUnit: 50 },
    { name: "Kivi", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, sugar: 9, defaultUnit: "adet", gramsPerUnit: 70 },
    { name: "Ananas", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, sugar: 10, defaultUnit: "dilim", gramsPerUnit: 100 },

    // Kuruyemiş ve Atıştırmalıklar
    { name: "Badem", calories: 579, protein: 21, carbs: 22, fat: 50, sugar: 4.4, defaultUnit: "porsiyon", gramsPerUnit: 30, gramsPerPiece: 1.2 },
    { name: "Ceviz", calories: 654, protein: 15, carbs: 14, fat: 65, sugar: 2.6, defaultUnit: "porsiyon", gramsPerUnit: 30, gramsPerPiece: 5 },
    { name: "Fındık", calories: 628, protein: 15, carbs: 17, fat: 61, sugar: 4.3, defaultUnit: "porsiyon", gramsPerUnit: 30, gramsPerPiece: 1 },
    { name: "Fıstık", calories: 567, protein: 26, carbs: 16, fat: 49, sugar: 4.2, defaultUnit: "porsiyon", gramsPerUnit: 30, gramsPerPiece: 0.7 },
    { name: "Kaju", calories: 553, protein: 18, carbs: 30, fat: 44, sugar: 6, defaultUnit: "porsiyon", gramsPerUnit: 30, gramsPerPiece: 1.5 },
    { name: "Ayçekirdeği", calories: 584, protein: 21, carbs: 20, fat: 51, sugar: 2.6, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Kabak Çekirdeği", calories: 559, protein: 30, carbs: 11, fat: 49, sugar: 1.4, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Kuru Üzüm", calories: 299, protein: 3.1, carbs: 79, fat: 0.5, sugar: 59, defaultUnit: "porsiyon", gramsPerUnit: 40 },
    { name: "Kuru Kayısı", calories: 241, protein: 3.4, carbs: 63, fat: 0.5, sugar: 53, defaultUnit: "adet", gramsPerUnit: 8 },
    { name: "Hurma", calories: 282, protein: 2.5, carbs: 75, fat: 0.4, sugar: 66, defaultUnit: "adet", gramsPerUnit: 24 },

    // İçecekler
    { name: "Kahve", calories: 2, protein: 0.3, carbs: 0, fat: 0, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 240 },
    { name: "Çay", calories: 2, protein: 0, carbs: 0.7, fat: 0, sugar: 0, defaultUnit: "porsiyon", gramsPerUnit: 240 },
    { name: "Portakal Suyu", calories: 45, protein: 0.7, carbs: 10, fat: 0.2, sugar: 8.4, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Elma Suyu", calories: 46, protein: 0.1, carbs: 11, fat: 0.1, sugar: 10, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Kola", calories: 41, protein: 0, carbs: 10, fat: 0, sugar: 10, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Gazoz", calories: 41, protein: 0, carbs: 11, fat: 0, sugar: 11, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Soğuk Çay", calories: 35, protein: 0, carbs: 9, fat: 0, sugar: 8.5, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Meyve Suyu", calories: 50, protein: 0.5, carbs: 12, fat: 0.1, sugar: 11, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Limonata", calories: 40, protein: 0.1, carbs: 10, fat: 0, sugar: 9, defaultUnit: "porsiyon", gramsPerUnit: 240 },
    { name: "Smoothie", calories: 95, protein: 2, carbs: 22, fat: 0.5, sugar: 18, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "Protein Shake", calories: 120, protein: 20, carbs: 5, fat: 2, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 250 },

    // Tatlılar
    { name: "Baklava", calories: 334, protein: 4, carbs: 42, fat: 17, sugar: 27, defaultUnit: "dilim", gramsPerUnit: 70 },
    { name: "Künefe", calories: 320, protein: 7, carbs: 36, fat: 16, sugar: 24, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Sütlaç", calories: 122, protein: 3.5, carbs: 20, fat: 3, sugar: 15, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Muhallebi", calories: 115, protein: 2.8, carbs: 18, fat: 3.5, sugar: 14, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Dondurma", calories: 207, protein: 3.5, carbs: 24, fat: 11, sugar: 21, defaultUnit: "porsiyon", gramsPerUnit: 100 },
    { name: "Pasta", calories: 257, protein: 3, carbs: 36, fat: 12, sugar: 25, defaultUnit: "dilim", gramsPerUnit: 100 },
    { name: "Çikolata", calories: 546, protein: 5, carbs: 61, fat: 31, sugar: 48, defaultUnit: "adet", gramsPerUnit: 50 },
    { name: "Kurabiye", calories: 480, protein: 6, carbs: 64, fat: 22, sugar: 28, defaultUnit: "adet", gramsPerUnit: 30 },
    { name: "Waffle", calories: 291, protein: 6, carbs: 37, fat: 13, sugar: 10, defaultUnit: "adet", gramsPerUnit: 100 },
    { name: "Profiterol", calories: 335, protein: 6, carbs: 28, fat: 22, sugar: 18, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    // Yeni Tatlılar
    { name: "Kek", calories: 257, protein: 3, carbs: 45, fat: 8, sugar: 28, defaultUnit: "dilim", gramsPerUnit: 80, gramsPerPiece: 80 },
    { name: "Çikolatalı Kek", calories: 370, protein: 5, carbs: 52, fat: 16, sugar: 35, defaultUnit: "dilim", gramsPerUnit: 80, gramsPerPiece: 80 },
    { name: "Cheesecake", calories: 321, protein: 5, carbs: 26, fat: 22, sugar: 20, defaultUnit: "dilim", gramsPerUnit: 100 },
    { name: "Tiramisu", calories: 283, protein: 5, carbs: 30, fat: 15, sugar: 24, defaultUnit: "porsiyon", gramsPerUnit: 120 },
    { name: "Sufle", calories: 350, protein: 6, carbs: 40, fat: 18, sugar: 32, defaultUnit: "adet", gramsPerUnit: 150, gramsPerPiece: 150 },
    { name: "Brownie", calories: 466, protein: 6, carbs: 55, fat: 25, sugar: 38, defaultUnit: "adet", gramsPerUnit: 60, gramsPerPiece: 60 },
    { name: "Magnolia", calories: 280, protein: 4, carbs: 32, fat: 15, sugar: 25, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Kazandibi", calories: 180, protein: 4, carbs: 28, fat: 6, sugar: 22, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Keşkül", calories: 175, protein: 5, carbs: 26, fat: 5, sugar: 20, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Tavuk Göğsü Tatlısı", calories: 168, protein: 5, carbs: 27, fat: 4, sugar: 22, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Aşure", calories: 150, protein: 3, carbs: 30, fat: 3, sugar: 18, defaultUnit: "porsiyon", gramsPerUnit: 200 },
    { name: "Revani", calories: 280, protein: 4, carbs: 48, fat: 9, sugar: 32, defaultUnit: "dilim", gramsPerUnit: 80 },
    { name: "Şekerpare", calories: 350, protein: 3, carbs: 52, fat: 15, sugar: 40, defaultUnit: "adet", gramsPerUnit: 40, gramsPerPiece: 40 },
    { name: "Lokma", calories: 310, protein: 4, carbs: 45, fat: 13, sugar: 25, defaultUnit: "adet", gramsPerUnit: 15, gramsPerPiece: 15 },
    { name: "Tulumba", calories: 365, protein: 4, carbs: 48, fat: 18, sugar: 30, defaultUnit: "adet", gramsPerUnit: 25, gramsPerPiece: 25 },

    // Atıştırmalıklar
    { name: "Cips", calories: 536, protein: 7, carbs: 53, fat: 33, sugar: 0.5, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Kraker", calories: 470, protein: 10, carbs: 68, fat: 17, sugar: 6, defaultUnit: "adet", gramsPerUnit: 10, gramsPerPiece: 10 },
    { name: "Bisküvi", calories: 480, protein: 6, carbs: 66, fat: 21, sugar: 25, defaultUnit: "adet", gramsPerUnit: 15, gramsPerPiece: 15 },
    { name: "Gofret", calories: 530, protein: 5, carbs: 58, fat: 30, sugar: 28, defaultUnit: "adet", gramsPerUnit: 30, gramsPerPiece: 30 },
    { name: "Çikolatalı Bar", calories: 480, protein: 8, carbs: 50, fat: 28, sugar: 35, defaultUnit: "adet", gramsPerUnit: 50, gramsPerPiece: 50 },
    { name: "Granola Bar", calories: 390, protein: 8, carbs: 64, fat: 12, sugar: 24, defaultUnit: "adet", gramsPerUnit: 35, gramsPerPiece: 35 },
    { name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fat: 6, sugar: 4, defaultUnit: "adet", gramsPerUnit: 60, gramsPerPiece: 60 },
    { name: "Mısır Patlağı", calories: 387, protein: 13, carbs: 78, fat: 4, sugar: 0.9, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Patlamış Mısır", calories: 387, protein: 13, carbs: 78, fat: 4, sugar: 0.9, defaultUnit: "porsiyon", gramsPerUnit: 30 },

    // Kahvaltılık Ekstralar
    { name: "Granola", calories: 450, protein: 10, carbs: 66, fat: 17, sugar: 22, defaultUnit: "porsiyon", gramsPerUnit: 50 },
    { name: "Müsli", calories: 360, protein: 9, carbs: 68, fat: 6, sugar: 18, defaultUnit: "porsiyon", gramsPerUnit: 50 },
    { name: "Krep", calories: 227, protein: 6, carbs: 28, fat: 10, sugar: 5, defaultUnit: "adet", gramsPerUnit: 80, gramsPerPiece: 80 },
    { name: "Pankek", calories: 227, protein: 6, carbs: 38, fat: 5, sugar: 8, defaultUnit: "adet", gramsPerUnit: 60, gramsPerPiece: 60 },
    { name: "Lokum", calories: 350, protein: 0, carbs: 90, fat: 0, sugar: 80, defaultUnit: "adet", gramsPerUnit: 8, gramsPerPiece: 8 },
    { name: "Helva", calories: 516, protein: 12, carbs: 56, fat: 28, sugar: 40, defaultUnit: "dilim", gramsPerUnit: 30 },

    // Markalı Ürünler - Atıştırmalıklar
    { name: "Eti Browni", calories: 450, protein: 5, carbs: 52, fat: 24, sugar: 38, defaultUnit: "adet", gramsPerUnit: 40, gramsPerPiece: 40 },
    { name: "Eti Pop Kek", calories: 420, protein: 5, carbs: 55, fat: 20, sugar: 32, defaultUnit: "adet", gramsPerUnit: 50, gramsPerPiece: 50 },
    { name: "Eti Tutku", calories: 520, protein: 6, carbs: 60, fat: 28, sugar: 35, defaultUnit: "adet", gramsPerUnit: 30, gramsPerPiece: 30 },
    { name: "Eti Canga", calories: 530, protein: 7, carbs: 58, fat: 30, sugar: 40, defaultUnit: "adet", gramsPerUnit: 45, gramsPerPiece: 45 },
    { name: "Eti Negro", calories: 480, protein: 6, carbs: 62, fat: 23, sugar: 32, defaultUnit: "adet", gramsPerUnit: 35, gramsPerPiece: 35 },
    { name: "Eti Burçak", calories: 450, protein: 8, carbs: 65, fat: 18, sugar: 20, defaultUnit: "adet", gramsPerUnit: 10, gramsPerPiece: 10 },
    { name: "Eti Hoşbeş", calories: 460, protein: 5, carbs: 68, fat: 18, sugar: 28, defaultUnit: "adet", gramsPerUnit: 25, gramsPerPiece: 25 },
    { name: "Eti Cin", calories: 490, protein: 6, carbs: 60, fat: 25, sugar: 30, defaultUnit: "adet", gramsPerUnit: 30, gramsPerPiece: 30 },
    { name: "Ülker Çokoprens", calories: 510, protein: 6, carbs: 58, fat: 28, sugar: 35, defaultUnit: "adet", gramsPerUnit: 30, gramsPerPiece: 30 },
    { name: "Ülker Halley", calories: 470, protein: 5, carbs: 62, fat: 22, sugar: 38, defaultUnit: "adet", gramsPerUnit: 30, gramsPerPiece: 30 },
    { name: "Ülker Dankek", calories: 400, protein: 5, carbs: 50, fat: 20, sugar: 30, defaultUnit: "adet", gramsPerUnit: 50, gramsPerPiece: 50 },
    { name: "Ülker Albeni", calories: 520, protein: 5, carbs: 55, fat: 30, sugar: 40, defaultUnit: "adet", gramsPerUnit: 40, gramsPerPiece: 40 },
    { name: "Ülker Metro", calories: 480, protein: 7, carbs: 52, fat: 26, sugar: 38, defaultUnit: "adet", gramsPerUnit: 36, gramsPerPiece: 36 },
    { name: "Ülker Hanımeller", calories: 500, protein: 6, carbs: 60, fat: 26, sugar: 32, defaultUnit: "adet", gramsPerUnit: 25, gramsPerPiece: 25 },
    { name: "Ruffles Original", calories: 540, protein: 6, carbs: 52, fat: 34, sugar: 1, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Ruffles Peynirli", calories: 545, protein: 7, carbs: 50, fat: 35, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Lay's Klasik", calories: 536, protein: 6, carbs: 52, fat: 34, sugar: 0.5, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Doritos Nacho", calories: 500, protein: 7, carbs: 58, fat: 26, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Doritos Taco", calories: 495, protein: 7, carbs: 60, fat: 25, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Cheetos", calories: 520, protein: 6, carbs: 58, fat: 30, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Pringles Original", calories: 520, protein: 4, carbs: 52, fat: 33, sugar: 1, defaultUnit: "porsiyon", gramsPerUnit: 30 },
    { name: "Snickers", calories: 488, protein: 8, carbs: 55, fat: 25, sugar: 48, defaultUnit: "adet", gramsPerUnit: 50, gramsPerPiece: 50 },
    { name: "Mars Bar", calories: 450, protein: 4, carbs: 68, fat: 18, sugar: 60, defaultUnit: "adet", gramsPerUnit: 51, gramsPerPiece: 51 },
    { name: "Twix", calories: 495, protein: 5, carbs: 62, fat: 25, sugar: 46, defaultUnit: "adet", gramsPerUnit: 50, gramsPerPiece: 50 },
    { name: "Milka Çikolata", calories: 530, protein: 6, carbs: 58, fat: 30, sugar: 52, defaultUnit: "adet", gramsPerUnit: 100, gramsPerPiece: 100 },
    { name: "Toblerone", calories: 525, protein: 5, carbs: 60, fat: 29, sugar: 55, defaultUnit: "adet", gramsPerUnit: 50, gramsPerPiece: 50 },
    { name: "Kinder Bueno", calories: 570, protein: 9, carbs: 49, fat: 38, sugar: 40, defaultUnit: "adet", gramsPerUnit: 43, gramsPerPiece: 43 },
    { name: "Kinder Surprise", calories: 560, protein: 8, carbs: 52, fat: 35, sugar: 50, defaultUnit: "adet", gramsPerUnit: 20, gramsPerPiece: 20 },
    { name: "Nestle Crunch", calories: 510, protein: 6, carbs: 60, fat: 27, sugar: 48, defaultUnit: "adet", gramsPerUnit: 40, gramsPerPiece: 40 },
    { name: "KitKat", calories: 520, protein: 7, carbs: 61, fat: 27, sugar: 45, defaultUnit: "adet", gramsPerUnit: 41.5, gramsPerPiece: 41.5 },

    // Markalı İçecekler
    { name: "Coca Cola", calories: 42, protein: 0, carbs: 10.6, fat: 0, sugar: 10.6, defaultUnit: "adet", gramsPerUnit: 330, gramsPerPiece: 330 },
    { name: "Coca Cola Zero", calories: 0.5, protein: 0, carbs: 0, fat: 0, sugar: 0, defaultUnit: "adet", gramsPerUnit: 330, gramsPerPiece: 330 },
    { name: "Fanta", calories: 45, protein: 0, carbs: 11.2, fat: 0, sugar: 11, defaultUnit: "adet", gramsPerUnit: 330, gramsPerPiece: 330 },
    { name: "Sprite", calories: 40, protein: 0, carbs: 10, fat: 0, sugar: 10, defaultUnit: "adet", gramsPerUnit: 330, gramsPerPiece: 330 },
    { name: "Red Bull", calories: 45, protein: 0, carbs: 11, fat: 0, sugar: 11, defaultUnit: "adet", gramsPerUnit: 250, gramsPerPiece: 250 },
    { name: "Monster Energy", calories: 42, protein: 0, carbs: 11, fat: 0, sugar: 10, defaultUnit: "adet", gramsPerUnit: 473, gramsPerPiece: 473 },
    { name: "Nescafe 3ü1 Arada", calories: 70, protein: 1, carbs: 12, fat: 2, sugar: 9, defaultUnit: "adet", gramsPerUnit: 18, gramsPerPiece: 18 },

    // Yemekler
    { name: "Kuru Fasulye", calories: 120, protein: 7, carbs: 22, fat: 0.5, sugar: 1, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Mercimek Çorbası", calories: 95, protein: 6, carbs: 16, fat: 1, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "Ezogelin Çorbası", calories: 105, protein: 4.5, carbs: 18, fat: 2, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "Tavuk Çorbası", calories: 80, protein: 8, carbs: 8, fat: 2, sugar: 1.5, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "Domates Çorbası", calories: 75, protein: 2, carbs: 14, fat: 1.5, sugar: 8, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "İmam Bayıldı", calories: 180, protein: 2.5, carbs: 18, fat: 12, sugar: 10, defaultUnit: "porsiyon", gramsPerUnit: 200 },
    { name: "Karnıyarık", calories: 250, protein: 12, carbs: 22, fat: 13, sugar: 8, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "Türlü", calories: 90, protein: 2.5, carbs: 14, fat: 3, sugar: 7, defaultUnit: "porsiyon", gramsPerUnit: 200 },
    { name: "Mantı", calories: 320, protein: 14, carbs: 48, fat: 8, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 250 },
    { name: "Lahmacun", calories: 235, protein: 10, carbs: 30, fat: 8, sugar: 3.5, defaultUnit: "adet", gramsPerUnit: 120 },
    { name: "Pide", calories: 280, protein: 12, carbs: 40, fat: 8, sugar: 2.5, defaultUnit: "dilim", gramsPerUnit: 150 },
    { name: "Pizza", calories: 266, protein: 11, carbs: 33, fat: 10, sugar: 3.5, defaultUnit: "dilim", gramsPerUnit: 120 },
    { name: "Hamburger", calories: 295, protein: 17, carbs: 24, fat: 14, sugar: 6, defaultUnit: "adet", gramsPerUnit: 200 },
    { name: "Döner", calories: 265, protein: 18, carbs: 22, fat: 12, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Şiş Kebap", calories: 280, protein: 25, carbs: 8, fat: 16, sugar: 2, defaultUnit: "porsiyon", gramsPerUnit: 200 },
    { name: "Adana Kebap", calories: 310, protein: 22, carbs: 10, fat: 20, sugar: 2.5, defaultUnit: "porsiyon", gramsPerUnit: 200 },
    { name: "Çiğ Köfte", calories: 250, protein: 5, carbs: 45, fat: 6, sugar: 3, defaultUnit: "porsiyon", gramsPerUnit: 150 },
    { name: "Kumpir", calories: 350, protein: 8, carbs: 55, fat: 12, sugar: 4, defaultUnit: "porsiyon", gramsPerUnit: 400 },
    { name: "Tost", calories: 280, protein: 14, carbs: 28, fat: 12, sugar: 2, defaultUnit: "adet", gramsPerUnit: 150 },
    { name: "Sandviç", calories: 320, protein: 15, carbs: 35, fat: 13, sugar: 4, defaultUnit: "adet", gramsPerUnit: 180 }
];

// Helper function to search foods (WITH FUZZY MATCHING for autocomplete)
export function searchFoods(query: string, limit: number = 8): string[] {
    if (query.length < 2) return [];

    const normalized = normalizeTurkish(query);

    // Score all foods based on matching quality
    const scored = FOODS.map(food => {
        const foodNormalized = normalizeTurkish(food.name);

        // Exact match gets highest score
        if (foodNormalized === normalized) {
            return { name: food.name, score: 0 };
        }

        // Starts with query gets priority
        if (foodNormalized.startsWith(normalized)) {
            return { name: food.name, score: 1 };
        }

        // Contains query
        if (foodNormalized.includes(normalized)) {
            return { name: food.name, score: 2 };
        }

        // Fuzzy match
        const distance = levenshteinDistance(normalized, foodNormalized);
        const maxDistance = Math.ceil(normalized.length * 0.4); // 40% tolerance for autocomplete

        if (distance <= maxDistance) {
            return { name: food.name, score: 3 + distance };
        }

        return null;
    }).filter(item => item !== null) as { name: string, score: number }[];

    // Sort by score (lower is better) and return top results
    return scored
        .sort((a, b) => a.score - b.score)
        .slice(0, limit)
        .map(item => item.name);
}

// Levenshtein distance for fuzzy matching (typo tolerance)
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[len1][len2];
}

// Helper function to normalize Turkish characters
function normalizeTurkish(text: string): string {
    return text.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .trim();
}

// Helper function to find food by name (WITH FUZZY MATCHING)
export function findFood(name: string): FoodItem | undefined {
    const normalized = normalizeTurkish(name);

    // First try exact match
    const exactMatch = FOODS.find(food => normalizeTurkish(food.name) === normalized);
    if (exactMatch) return exactMatch;

    // If no exact match, find closest match using Levenshtein distance
    let bestMatch: FoodItem | undefined;
    let bestDistance = Infinity;
    const maxDistance = Math.ceil(normalized.length * 0.3); // Allow 30% character difference

    for (const food of FOODS) {
        const foodNormalized = normalizeTurkish(food.name);
        const distance = levenshteinDistance(normalized, foodNormalized);

        // If distance is within threshold and better than current best
        if (distance <= maxDistance && distance < bestDistance) {
            bestDistance = distance;
            bestMatch = food;
        }
    }

    return bestMatch;
}

// Calculate macros based on quantity - UNIVERSAL UNIT SUPPORT
export function calculateMacros(food: FoodItem, quantity: number, unit: string) {
    let grams = 0;

    // Convert EVERYTHING to grams first, regardless of food's defaultUnit
    const unitLower = unit.toLowerCase();

    if (unitLower === 'gram') {
        // Direct gram input
        grams = quantity;
    } else if (unitLower === 'adet') {
        // Piece-based: use gramsPerPiece if available, otherwise gramsPerUnit
        grams = quantity * (food.gramsPerPiece || food.gramsPerUnit);
    } else if (unitLower === 'porsiyon') {
        // Portion-based: use gramsPerUnit if defaultUnit is porsiyon, otherwise assume 100g
        if (food.defaultUnit === 'porsiyon') {
            grams = quantity * food.gramsPerUnit;
        } else if (food.gramsPerPiece) {
            // If gramsPerPiece exists, assume 1 porsiyon = 10 pieces (adjustable)
            grams = quantity * food.gramsPerPiece * 10;
        } else {
            grams = quantity * 100; // Standard portion = 100g
        }
    } else if (unitLower === 'dilim') {
        // Slice-based: use gramsPerUnit if defaultUnit is dilim, otherwise assume 30g
        if (food.defaultUnit === 'dilim') {
            grams = quantity * food.gramsPerUnit;
        } else {
            grams = quantity * 30; // Standard slice = 30g
        }
    } else {
        // Fallback: use default unit conversion
        grams = quantity * food.gramsPerUnit;
    }

    // Calculate macros based on grams (all values are per 100g)
    const multiplier = grams / 100;

    return {
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier * 10) / 10,
        carbs: Math.round(food.carbs * multiplier * 10) / 10,
        fat: Math.round(food.fat * multiplier * 10) / 10,
        sugar: Math.round(food.sugar * multiplier * 10) / 10
    };
}
