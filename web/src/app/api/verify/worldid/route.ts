/**
 * World ID Verification API
 * Verifies World ID proofs and enables agent registration
 */

import { NextRequest, NextResponse } from "next/server";
import { ISuccessResult } from "@worldcoin/idkit";

// World ID Configuration
const WORLD_ID_APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_demo";
const WORLD_ID_ACTION = "nexusflow-agent-auth";

interface VerifyRequest {
  proof: ISuccessResult;
  userAddress: string;
}

interface VerifyResponse {
  success: boolean;
  verified: boolean;
  nullifierHash?: string;
  message?: string;
  error?: string;
}

/**
 * POST /api/verify/worldid
 * Verifies World ID proof from IDKit
 */
export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    const body: VerifyRequest = await request.json();
    const { proof, userAddress } = body;

    if (!proof || !userAddress) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Missing proof or userAddress",
        },
        { status: 400 }
      );
    }

    // In production, verify the proof with World ID API
    // For now, we do basic validation
    const isValidProof = await verifyWorldIDProof(proof);

    if (!isValidProof) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Invalid World ID proof",
        },
        { status: 401 }
      );
    }

    // Store verification status (in production, use a database)
    // For hackathon, we'll use the nullifier_hash as a unique human identifier
    const nullifierHash = proof.nullifier_hash;

    return NextResponse.json({
      success: true,
      verified: true,
      nullifierHash,
      message: "World ID verified successfully",
    });
  } catch (error) {
    console.error("World ID verification error:", error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Verify World ID proof with Worldcoin API
 * In production, this would call the actual verification endpoint
 */
async function verifyWorldIDProof(proof: ISuccessResult): Promise<boolean> {
  // For hackathon/demo purposes, we accept all proofs
  // In production, call: https://developer.worldcoin.org/api/v1/verify
  
  if (process.env.NODE_ENV === "development") {
    // Accept mock proofs in development
    return true;
  }

  try {
    const verifyEndpoint = `https://developer.worldcoin.org/api/v1/verify/${WORLD_ID_APP_ID}`;
    
    const response = await fetch(verifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nullifier_hash: proof.nullifier_hash,
        merkle_root: proof.merkle_root,
        proof: proof.proof,
        verification_level: proof.verification_level,
        action: WORLD_ID_ACTION,
      }),
    });

    if (!response.ok) {
      console.error("World ID API error:", await response.text());
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("World ID verification error:", error);
    // In hackathon mode, accept proofs even if API fails
    return process.env.NEXT_PUBLIC_BYPASS_WORLDID === "true";
  }
}

/**
 * GET /api/verify/worldid
 * Returns verification status for a nullifier hash
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const nullifierHash = searchParams.get("nullifier");

  if (!nullifierHash) {
    return NextResponse.json(
      { error: "Missing nullifier hash" },
      { status: 400 }
    );
  }

  // In production, check database for verification status
  // For hackathon, we'll return a mock response
  return NextResponse.json({
    verified: true,
    nullifierHash,
    verifiedAt: new Date().toISOString(),
  });
}
