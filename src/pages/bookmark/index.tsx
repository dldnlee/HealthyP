import { db } from '@/api/pocketbase';
import { LargeCard, SkeletonLargeCard } from '@/components';

import getPbImage from '@/util/data/getPBImage';
import { getCurrentUserData } from '@/util';
import { Helmet } from 'react-helmet-async';
import { useInfinityCard } from '@/hooks/useInfinityCard';

function SkeletonLargeCardComponent() {
  return (
    <>
      <SkeletonLargeCard />
      <SkeletonLargeCard />
    </>
  );
}

export function BookmarkPage() {
  const getRecipeData = async ({ pageParam = 1 }) => {
    const currentUser = getCurrentUserData();
    const userBookmarks = currentUser?.bookmark;
    const conditions = userBookmarks.map((id: string) => {
      return `id = "${id}"`;
    });

    const recordsData = await db.collection('recipes').getList(pageParam, 6, {
      expand: 'rating, profile',
      filter: conditions.join(' || '),
    });
    return recordsData.items;
  };

  const { data, status, isFetchingNextPage, userData, ref } = useInfinityCard({
    callbackFn: getRecipeData,
    title: 'recipes',
  });

  const contents = data?.pages.map((recipes) =>
    recipes.map((recipe, index) => {
      const url = getPbImage('recipes', recipe.id, recipe.image);
      if (recipes.length === index + 1)
        return (
          <LargeCard
            innerRef={ref}
            key={index}
            id={recipe.id}
            userData={userData}
            rating={recipe.expand?.rating}
            url={recipe.image && url}
            desc={recipe.desc}
            title={recipe.title}
            profile={recipe.expand?.profile}
            keywords={recipe.keywords}
          />
        );
      return (
        <LargeCard
          key={index}
          id={recipe.id}
          userData={userData}
          rating={recipe.expand?.rating}
          url={recipe.image && url}
          desc={recipe.desc}
          title={recipe.title}
          profile={recipe.expand?.profile}
          keywords={recipe.keywords}
        />
      );
    })
  );

  if (status === 'pending')
    return (
      <div className="grid gap-6pxr pb-140pxr grid-cols-card justify-center w-full">
        <SkeletonLargeCardComponent />
      </div>
    );
  if (status === 'error')
    return (
      <div className="grid gap-6pxr pb-140pxr grid-cols-card justify-center w-full">
        <SkeletonLargeCardComponent />
      </div>
    );

  return (
    <div className="w-full h-full bg-gray-200 overflow-auto">
      <Helmet>
        <title>HealthyP | 북마크</title>
      </Helmet>

      <div className="grid gap-6pxr pb-140pxr grid-cols-card justify-center w-full">{contents}</div>

      {isFetchingNextPage && <SkeletonLargeCard />}
    </div>
  );
}
