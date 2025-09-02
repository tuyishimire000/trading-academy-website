import { NextResponse } from 'next/server';
import { ResourceCategory } from '@/lib/sequelize/models';

export async function GET() {
  try {
    const categories = await ResourceCategory.findAll({
      order: [['name', 'ASC']]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching resource categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
