import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface UserActivity {
  id: string;
  user_email: string;
  extracted_text: string;
  analysis_result: string;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

// Database operations
export const insertUserActivity = async (data: {
  user_email: string;
  extracted_text: string;
  analysis_result?: string;
  file_name?: string;
  file_type?: string;
}): Promise<UserActivity | null> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return null;
  }

  try {
    const { data: result, error } = await supabase
      .from('useractivity')
      .insert([{
        user_email: data.user_email,
        extracted_text: data.extracted_text,
        analysis_result: data.analysis_result || '',
        file_name: data.file_name || null,
        file_type: data.file_type || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting user activity:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error in insertUserActivity:', error);
    return null;
  }
};

export const getUserActivities = async (userEmail: string): Promise<UserActivity[]> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('useractivity')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserActivities:', error);
    return [];
  }
};

export const updateUserActivityAnalysis = async (
  id: string, 
  analysisResult: string
): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('useractivity')
      .update({ analysis_result: analysisResult })
      .eq('id', id);

    if (error) {
      console.error('Error updating user activity analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserActivityAnalysis:', error);
    return false;
  }
};