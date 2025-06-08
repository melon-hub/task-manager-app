'use client';

import React from 'react';
import { CardItem } from './CardItem';
import { Card } from '@/types';

interface CardItemMemoProps {
  card: Card;
}

export const CardItemMemo = React.memo(CardItem, (prevProps, nextProps) => {
  // Only re-render if card data actually changed
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.description === nextProps.card.description &&
    prevProps.card.priority === nextProps.card.priority &&
    prevProps.card.completed === nextProps.card.completed &&
    prevProps.card.position === nextProps.card.position &&
    prevProps.card.bucketId === nextProps.card.bucketId &&
    prevProps.card.updatedAt === nextProps.card.updatedAt &&
    JSON.stringify(prevProps.card.labels) === JSON.stringify(nextProps.card.labels) &&
    JSON.stringify(prevProps.card.checklist) === JSON.stringify(nextProps.card.checklist) &&
    JSON.stringify(prevProps.card.assignees) === JSON.stringify(nextProps.card.assignees)
  );
});