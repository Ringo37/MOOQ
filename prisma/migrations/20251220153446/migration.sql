-- CreateTable
CREATE TABLE "_Favorite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Favorite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Favorite_B_index" ON "_Favorite"("B");

-- AddForeignKey
ALTER TABLE "_Favorite" ADD CONSTRAINT "_Favorite_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Favorite" ADD CONSTRAINT "_Favorite_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
