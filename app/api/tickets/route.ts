import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import FileUploadService from '@/services/fileUploadService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const subject = formData.get('subject') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const userEmail = formData.get('userEmail') as string;
    const username = formData.get('username') as string;
    
    // Get uploaded files
    const files = formData.getAll('files') as File[];
    
    if (!subject || !category || !priority || !description || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create ticket in database first
    const { data: ticket, error: ticketError } = await supabaseServer
      .from('support_tickets')
      .insert([
        {
          user_id: userId,
          subject: subject,
          category: category,
          priority: priority,
          description: description,
          status: 'open',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (ticketError) {
      console.error('Ticket creation error:', ticketError);
      return NextResponse.json(
        { success: false, message: 'Failed to create ticket in database' },
        { status: 500 }
      );
    }

    // Upload files to Supabase Storage and save metadata
    const uploadedFiles = [];
    if (files && files.length > 0) {
      console.log(`Processing ${files.length} files for upload...`);
      for (const file of files) {
        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
        const uploadResult = await FileUploadService.uploadFile(file, userId, ticket.id);
        console.log('Upload result:', uploadResult);
        if (uploadResult.success) {
          uploadedFiles.push({
            file_name: uploadResult.fileName,
            file_url: uploadResult.url,
            original_name: file.name,
            file_size: file.size,
            file_type: file.type
          });
        } else {
          console.error('File upload failed:', uploadResult.error);
        }
      }

      // Save file metadata to database
      if (uploadedFiles.length > 0) {
        const { error: fileError } = await supabaseServer
          .from('ticket_attachments')
          .insert(
            uploadedFiles.map(file => ({
              ticket_id: ticket.id,
              file_name: file.file_name,
              file_url: file.file_url,
              original_name: file.original_name,
              file_size: file.file_size,
              file_type: file.file_type
            }))
          );

        if (fileError) {
          console.error('File metadata save error:', fileError);
          // Don't fail the entire request if file metadata saving fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket submitted successfully',
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        created_at: ticket.created_at
      },
      attachments: uploadedFiles.length
    });

  } catch (error) {
    console.error('Ticket submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's tickets with attachments
    const { data: tickets, error } = await supabaseServer
      .from('support_tickets')
      .select(`
        *,
        ticket_attachments (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Tickets fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || []
    });

  } catch (error) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
