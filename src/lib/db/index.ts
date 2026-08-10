import { supabase } from '../supabase';
import { sqliteDb } from './sqlite';

// Use environment variable to determine which database to use
const USE_SQLITE = true; // You can make this an environment variable if needed

export const db = USE_SQLITE ? sqliteDb : {
  surveys: {
    insert: async (data: Record<string, unknown>) => {
      return await supabase.from('surveys').insert(data);
    },
    select: async () => {
      return await supabase.from('surveys').select('*').order('created_at', { ascending: false });
    },
    getStats: async () => {
      const { data: surveys, error } = await supabase
        .from('surveys')
        .select('*');

      if (error) return { data: null, error };

      const averageRating = surveys.reduce((acc, curr) => acc + curr.rating, 0) / surveys.length;

      const genderDistribution = surveys.reduce<Record<string, number>>((acc, curr) => {
        acc[curr.gender] = (acc[curr.gender] || 0) + 1;
        return acc;
      }, {});

      const ageDistribution = surveys.reduce<Record<string, number>>((acc, curr) => {
        const ageGroup = curr.age < 20 ? '<20' :
          curr.age <= 30 ? '20-30' :
          curr.age <= 40 ? '31-40' : '40+';
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
      }, {});

      return {
        data: {
          averageRating,
          genderDistribution: Object.entries(genderDistribution).map(([gender, count]) => ({
            gender,
            count
          })),
          ageDistribution: Object.entries(ageDistribution).map(([age_group, count]) => ({
            age_group,
            count
          }))
        },
        error: null
      };
    }
  }
};
