/** @format */

// Animatak_ 24/01/2025
/*
 *   All artwork used here is by Lanboost
 */

import { using } from './ModClasses.js';
import { translate } from './translate.js';

using('Terraria');
using('Terraria.ID');
using('Microsoft.Xna.Framework');
using('Microsoft.Xna.Framework.Graphics');

const SetDefaults = Item['void SetDefaults(int Type, bool noMatCheck, ItemVariant variant)'];
const SetDefaults2 = Item['void SetDefaults(int Type)'];

const SetupRecipes = Recipe['void SetupRecipes()'];
const AddRecipe = Recipe['void AddRecipe()'];

const Op_Addition = Vector2['Vector2 op_Addition(Vector2 value1, Vector2 value2)'];
const Op_Subtraction = Vector2['Vector2 op_Subtraction(Vector2 value1, Vector2 value2)'];
const Op_Multiply = Vector2['Vector2 op_Multiply(Vector2 value, float scaleFactor)'];

const nVector2 = Vector2.new()['void .ctor(float x, float y)'];
const nColor = Color.new()['void .ctor(int r, int g, int b, int a)'];

const { KillTile, KillWall, PlaceTile, PlaceWall } = WorldGen;

const WoodHouseItem = 3847;
const StoneHouseItem = 3848;

let woodHouse = null;
let stoneHouse = null;
let woodHouseIcon = null;
let stoneHouseIcon = null;

class HouseBuilder {
	static tiles = [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 5, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 3, 0, 4, 1],
		[1, 2, 1, 2, 1]
	];

	static walls = [
		[0, 0, 0, 0, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 0, 0, 0, 0]
	];

	static houseBlocks = {
		3847: {
			tiles: {
				1: TileID.WoodBlock,
				2: TileID.Platforms,
				3: TileID.WorkBenches,
				4: TileID.Chairs,
				5: TileID.Torches
			},
			walls: {
				1: WallID.Wood
			}
		},
		3848: {
			tiles: {
				1: TileID.Stone,
				2: TileID.Platforms,
				3: TileID.WorkBenches,
				4: TileID.Chairs,
				5: TileID.Torches
			},
			walls: {
				1: WallID.Stone
			}
		}
	};

	static canPlaceTile(x, y) {
		const tile = Main.tile.get_Item(x, y);
		return tile && !tile['bool active()']();
	}

	static canPlaceStructure(x, y, tiles, walls) {
		for (let row = 0; row < tiles.length; row++) {
			for (let col = 0; col < tiles[row].length; col++) {
				const tileId = tiles[row][col];
				const wallId = walls[row][col];

				const cx = x + col;
				const cy = y + row - tiles.length + 1;

				if (tileId > 0 && !HouseBuilder.canPlaceTile(cx, cy)) {
					return false;
				}

				if (wallId > 0) {
					const tile = Main.tile.get_Item(cx, cy);
					if (!tile || tile.wall != 0) {
						return false;
					}
				}
			}
		}

		return true;
	}

	static buildHouse(x, y, type) {
		const houseData = HouseBuilder.houseBlocks[type];
		const { tiles, walls } = houseData;

		if (!HouseBuilder.canPlaceStructure(x, y, HouseBuilder.tiles, HouseBuilder.walls)) {
			Main.NewText(translate.wrongUsageItem(), 255, 0, 0);
			return false;
		}

		let builtHouse = false;

		for (let row = 0; row < HouseBuilder.tiles.length; row++) {
			for (let col = 0; col < HouseBuilder.tiles[row].length; col++) {
				const tileId = HouseBuilder.tiles[row][col];
				const wallId = HouseBuilder.walls[row][col];

				const cx = x + col;
				const cy = y + row - HouseBuilder.tiles.length + 1;

				if (tileId > 0) {
					KillTile(cx, cy, false, false, false);
					PlaceTile(cx, cy, tiles[tileId], false, false, -1, 0);
					builtHouse = true;
				}

				if (wallId > 0) {
					KillWall(cx, cy, false);
					PlaceWall(cx, cy, walls[wallId], false);
				}
			}
		}

		if (builtHouse) {
			const workbenchX = x + 1;
			const workbenchY = y - 1;

			const chairX = x + 3;
			const chairY = y - 1;

			KillTile(workbenchX, workbenchY, false, false, false);
			PlaceTile(workbenchX, workbenchY, tiles[3], false, false, -1, 0);

			KillTile(chairX, chairY, false, false, false);
			PlaceTile(chairX, chairY, tiles[4], false, false, -1, 0);
		}

		return true;
	}
}

Player.UpdateEquips.hook((original, player, i) => {
	const result = original(player, i);

	if ((player.HeldItem.type == WoodHouseItem || player.HeldItem.type == StoneHouseItem) && player.controlUseItem && player.releaseUseItem) {
		const cursorX = Main.mouseX + Main.screenPosition.X;
		const cursorY = Main.mouseY + Main.screenPosition.Y;

		const tileX = Math.floor(cursorX / 16);
		const tileY = Math.floor(cursorY / 16);

		if (HouseBuilder.buildHouse(tileX, tileY, player.HeldItem.type)) {
			player.HeldItem.stack--;
		}
	}

	return result;
});

Main.Initialize_AlmostEverything.hook((orig, self) => {
	orig(self);
	woodHouse = tl.texture.load('Textures/WoodHouse.png');
	stoneHouse = tl.texture.load('Textures/StoneHouse.png');

	woodHouseIcon = tl.texture.load('Textures/woodHouseIcon.png');
	stoneHouseIcon = tl.texture.load('Textures/stoneHouseIcon.png');
	if (woodHouseIcon != null) {
		GameContent.TextureAssets.Item[3847].Value = woodHouseIcon;
	}
	if (stoneHouseIcon != null) {
		GameContent.TextureAssets.Item[3848].Value = stoneHouseIcon;
	}
});

class ExtraDraw {
	static drawCursor(texture, displayCoord, scaleFactor) {
		const color = nColor(255, 255, 255, 127);
		const position = Op_Multiply(Op_Subtraction(displayCoord, nVector2(0, texture.Height)), scaleFactor);

		Main.spriteBatch[
			'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)'
		](texture, position, null, color, 0, Vector2.Zero, nVector2(scaleFactor, scaleFactor), SpriteEffects.None, 0);
	}

	static addExtraDraw() {
		const scaleFactor = 1 / Main.UIScale;

		const correctedMousePosition = Op_Multiply(nVector2(Main.mouseX, Main.mouseY), Main.UIScale);

		const mouseWorldPosition = Op_Addition(Main.screenPosition, correctedMousePosition);

		const tileCoord = nVector2(Math.floor(mouseWorldPosition.X / 16), Math.floor(mouseWorldPosition.Y / 16));

		const displayCoord = Op_Subtraction(nVector2(tileCoord.X * 16, tileCoord.Y * 16 + 16), Main.screenPosition);

		const mPlayer = Main.LocalPlayer;
		const HeldItem = mPlayer?.HeldItem;

		if (HeldItem.type == WoodHouseItem) {
			mPlayer.cursorItemIconEnabled = true;
			ExtraDraw.drawCursor(woodHouse, displayCoord, scaleFactor);
		}
		if (HeldItem.type == StoneHouseItem) {
			mPlayer.cursorItemIconEnabled = true;
			ExtraDraw.drawCursor(stoneHouse, displayCoord, scaleFactor);
		}
	}
}

Main.DrawRain.hook((original, self) => {
	original(self);
	ExtraDraw.addExtraDraw();
});

SetDefaults.hook((original, self, Type, noMatCheck, variant) => {
	original(self, Type, noMatCheck, variant);

	if (Type == WoodHouseItem) {
		self.useStyle = 5;
		self.useTime = 20;
		self.useAnimation = 20;
		self.maxStack = 9999;
		self.rare = 1;
		self._nameOverride = 'Wood House';
		self.BestiaryNotes = 'Make a Wooden House :)';
	}

	if (Type == StoneHouseItem) {
		self.useStyle = 5;
		self.useTime = 20;
		self.useAnimation = 20;
		self.maxStack = 9999;
		self.rare = 1;
		self._nameOverride = 'Stone House';
		self.BestiaryNotes = 'Make a Stone House :)';
	}
});

SetupRecipes.hook(original => {
	SetDefaults2(Recipe.currentRecipe.createItem, WoodHouseItem);
	Recipe.currentRecipe.createItem.stack = 1;
	SetDefaults2(Recipe.currentRecipe.requiredItem[0], ItemID.Wood);
	Recipe.currentRecipe.requiredItem[0].stack = 53;
	SetDefaults2(Recipe.currentRecipe.requiredItem[1], ItemID.Gel);
	Recipe.currentRecipe.requiredItem[1].stack = 1;
	Recipe.currentRecipe.requiredTile[0] = TileID.WorkBenches;
	AddRecipe();

	SetDefaults2(Recipe.currentRecipe.createItem, StoneHouseItem);
	Recipe.currentRecipe.createItem.stack = 1;
	SetDefaults2(Recipe.currentRecipe.requiredItem[0], ItemID.StoneBlock);
	Recipe.currentRecipe.requiredItem[0].stack = 36;
	SetDefaults2(Recipe.currentRecipe.requiredItem[1], ItemID.Wood);
	Recipe.currentRecipe.requiredItem[1].stack = 16;
	SetDefaults2(Recipe.currentRecipe.requiredItem[2], ItemID.Gel);
	Recipe.currentRecipe.requiredItem[2].stack = 1;
	Recipe.currentRecipe.requiredTile[0] = TileID.WorkBenches;
	AddRecipe();

	original();
});
