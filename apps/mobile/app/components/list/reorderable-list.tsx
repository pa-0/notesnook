/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { useThemeColors } from "@notesnook/theme";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  DraxList,
  DraxListProps,
  DraxListRenderItemContent,
  DraxProvider
} from "react-native-drax";
import { tabBarRef } from "../../utils/global-refs";
import { SIZE } from "../../utils/size";
import { IconButton } from "../ui/icon-button";
import Paragraph from "../ui/typography/paragraph";
import { useSideBarDraggingStore } from "../side-menu/dragging-store";

interface ReorderableListProps<T extends { id: string }>
  extends Omit<DraxListProps<T>, "renderItem" | "data" | "renderItemContent"> {
  onListOrderChanged: (data: string[]) => void;
  renderDraggableItem: DraxListRenderItemContent<T>;
  data: T[];
  itemOrder: string[];
  hiddenItems: string[];
  onHiddenItemsChanged: (data: string[]) => void;
}

function ReorderableList<T extends { id: string }>({
  renderDraggableItem,
  data,
  onListOrderChanged,
  hiddenItems = [],
  itemOrder = [],
  onHiddenItemsChanged,
  ...restProps
}: ReorderableListProps<T>) {
  const { colors } = useThemeColors();
  const [itemOrderState, setItemsOrder] = useState(itemOrder);
  const [hiddenItemsState, setHiddenItems] = useState(hiddenItems);
  const dragging = useSideBarDraggingStore((state) => state.dragging);
  const listRef = useRef<FlatList | null>(null);

  if (dragging) {
    tabBarRef.current?.lock();
  } else {
    tabBarRef.current?.unlock();
  }

  useEffect(() => {
    setItemsOrder(itemOrder);
    setHiddenItems(hiddenItems);
  }, [itemOrder, hiddenItems]);

  const renderItemContent: DraxListRenderItemContent<T> = React.useCallback(
    (info, props) => {
      const isHidden = hiddenItemsState.indexOf(info?.item?.id) > -1;
      return isHidden && !dragging ? null : (
        <View
          style={{
            flexDirection: "row",
            opacity: isHidden ? 0.4 : 1,
            paddingHorizontal: 12
          }}
        >
          <View
            style={{
              flexGrow: 1
            }}
          >
            {renderDraggableItem(info, props)}
          </View>
          {dragging ? (
            <IconButton
              name={!isHidden ? "minus" : "plus"}
              color={colors.primary.icon}
              size={SIZE.lg}
              top={0}
              bottom={0}
              onPress={() => {
                const _hiddenItems = hiddenItemsState.slice();
                const index = _hiddenItems.indexOf(info.item.id);
                if (index === -1) {
                  _hiddenItems.push(info.item?.id);
                } else {
                  _hiddenItems.splice(index, 1);
                }
                onHiddenItemsChanged(_hiddenItems);
                setHiddenItems(_hiddenItems);
              }}
            />
          ) : null}
        </View>
      );
    },
    [
      colors.primary.icon,
      dragging,
      hiddenItemsState,
      onHiddenItemsChanged,
      renderDraggableItem
    ]
  );

  function getOrderedItems() {
    const items: T[] = [];
    data.forEach((item) => {
      const index = itemOrderState.indexOf(item?.id);
      if (index === -1) {
        items.push(item);
      } else {
        items.splice(index, 0, item);
      }
    });
    console.log(items.map((item) => item.id));
    return items;
  }

  return (
    <DraxProvider>
      <View style={styles.container}>
        <DraxList
          {...restProps}
          ref={listRef}
          data={getOrderedItems()}
          renderItemContent={renderItemContent}
          itemStyles={{
            hoverDragReleasedStyle: {
              display: "none"
            },
            dragReleasedStyle: {
              opacity: 1
            },
            hoverDraggingStyle: {
              backgroundColor: colors.secondary.background
            }
          }}
          longPressDelay={500}
          onItemDragStart={() =>
            useSideBarDraggingStore.setState({
              dragging: true
            })
          }
          lockItemDragsToMainAxis
          onItemReorder={({ fromIndex, fromItem, toIndex, toItem }) => {
            const newOrder = getOrderedItems().map((item) => item.id);
            const element = newOrder.splice(fromIndex, 1)[0];
            if (toIndex === 0) {
              newOrder.unshift(element);
            } else {
              newOrder.splice(toIndex, 0, element);
            }
            console.log(newOrder);
            setItemsOrder(newOrder);
            onListOrderChanged?.(newOrder);
          }}
          keyExtractor={(item) => (item as any).id}
        />
      </View>
    </DraxProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default ReorderableList;
