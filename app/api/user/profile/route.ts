import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';
import userService from '@/services/userService';
import otpService from '@/services/otpService';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const result = await userService.getUserById(verified.user.id);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.data 
    });
  } catch (err) {
    console.error('Profile GET route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, username, otp } = body;

    // Validate that at least one field is provided
    if (!firstName && !lastName && !email && !username) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one field must be provided for update' 
      }, { status: 400 });
    }

    // If OTP is provided, verify it first
    if (otp) {
      const otpResult = await otpService.verifyOTP({
        email: verified.user.email,
        otp,
        type: 'profile_update'
      });

      if (!otpResult.success) {
        return NextResponse.json({ 
          success: false, 
          message: otpResult.message 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'OTP verification required for profile updates' 
      }, { status: 400 });
    }

    // Update user profile - only include provided fields
    const updateData: any = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (email) updateData.email = email;
    if (username) updateData.username = username;

    const result = await userService.updateUser(verified.user.id, updateData);
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        message: result.error || 'Failed to update profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (err) {
    console.error('Profile PUT route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, username } = body;

    // Validate that at least one field is provided
    if (!firstName && !lastName && !email && !username) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one field must be provided for update' 
      }, { status: 400 });
    }

    // Store profile data temporarily in OTP context for verification
    const profileData: any = {};
    if (firstName) profileData.firstName = firstName;
    if (lastName) profileData.lastName = lastName;
    if (email) profileData.email = email;
    if (username) profileData.username = username;

    // Generate and send OTP for profile update
    const result = await otpService.generateAndSendOTP({ 
      email: verified.user.email, 
      type: 'profile_update', 
      firstName: verified.user.firstName,
      userData: profileData
    });

    return NextResponse.json({
      success: result.success,
      message: result.message
    });
  } catch (err) {
    console.error('Profile OTP generation route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
