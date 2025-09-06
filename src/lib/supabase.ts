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

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  context: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  type: 'user' | 'bot';
  content: string;
  attachment_type: string | null;
  created_at: string;
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
      .from('UserActivity')
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

// Chat session operations
export const createChatSession = async (data: {
  user_id: string;
  title?: string;
  context: string;
}): Promise<ChatSession | null> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return null;
  }

  try {
    const { data: result, error } = await supabase
      .from('chat_sessions')
      .insert([{
        user_id: data.user_id,
        title: data.title || 'New Chat',
        context: data.context,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error in createChatSession:', error);
    return null;
  }
};

export const getChatSessions = async (userId: string): Promise<ChatSession[]> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getChatSessions:', error);
    return [];
  }
};

export const insertChatMessage = async (data: {
  session_id: string;
  type: 'user' | 'bot';
  content: string;
  attachment_type?: string;
}): Promise<ChatMessage | null> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return null;
  }

  try {
    const { data: result, error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: data.session_id,
        type: data.type,
        content: data.content,
        attachment_type: data.attachment_type || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting chat message:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error in insertChatMessage:', error);
    return null;
  }
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    return [];
  }
};

export const updateChatSessionTitle = async (sessionId: string, title: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating chat session title:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateChatSessionTitle:', error);
    return false;
  }
};

export const deleteChatSession = async (sessionId: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteChatSession:', error);
    return false;
  }
};

export const getUserActivities = async (userEmail: string): Promise<UserActivity[]> => {
  if (!supabase) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('UserActivity')
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
      .from('UserActivity')
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