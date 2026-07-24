import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Lakukan query super ringan (1 baris saja) untuk memancing aktivitas di Supabase
    const { data, error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Supabase is awake!", 
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
