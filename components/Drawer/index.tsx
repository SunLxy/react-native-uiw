
import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  ViewProps,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';

const DEVICE_WIDTH = Dimensions.get('window').width;

export interface DrawerProps extends ViewProps {
  isOpen?: boolean;
  placement?: 'right' | 'left';
  drawerWidth?: number;
  drawerBackgroundColor?: string;
  onChange?: (isOpen: boolean) => void;
  openDrawer?: (isOpen: boolean) => void;
  closeDrawer?: (isOpen: boolean) => void;
}
export interface DrawerState {
  drawerValue: Animated.ValueXY;
  overlayValue: Animated.Value;
  zIndexValue: number;
}

export default class Drawer extends Component<DrawerProps, DrawerState> {
  static defaultProps = {
    placement: 'left',
    drawerBackgroundColor: '#fff',
    drawerWidth: 300,
    isOpen: false,
    onChange: () => null,
    openDrawer: () => null,
    closeDrawer: () => null,
  }
  constructor(props: DrawerProps) {
    super(props);

    const xy = { x: 0, y: 0 };
    if (props.placement === 'left') {
      xy.x = -(props.drawerWidth || 0);
    }
    if (props.placement === 'right') {
      xy.x = (DEVICE_WIDTH || 0);
    }
    this.state = {
      zIndexValue: 0,
      overlayValue: new Animated.Value(0),
      drawerValue: new Animated.ValueXY({ ...(this.getPosition()) }),
    };
  }
  UNSAFE_componentWillReceiveProps(nextProps: DrawerProps) {
    if (nextProps.isOpen !== this.props.isOpen) {
      this.handleDrawer(!!nextProps.isOpen);
    }
  }
  onOverlayClick = (e: GestureResponderEvent) =>{
    e.stopPropagation();
    this.closeDrawer()
  };
  render() {
    const { isOpen, drawerWidth, drawerBackgroundColor, placement } = this.props;
    const { drawerValue, overlayValue, zIndexValue } = this.state;
    const dynamicDrawerStyles = {
      backgroundColor: drawerBackgroundColor,
      width: drawerWidth,
      left: placement === 'left' ? 0 : null,
      right: placement === 'right' ? 0 : null,
    };

    const overlayOpacity = overlayValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
      extrapolate: 'clamp',
    });
    return (
      <>
        <Animated.View
          style={[styles.drawer, dynamicDrawerStyles, {
            width: drawerWidth,
            transform: [
              { translateX: drawerValue.x }, // x轴移动
              { translateY: drawerValue.y }, // y轴移动
            ]
          }]}>
          {this.props.children}
        </Animated.View>
        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[styles.overlay, styles.positionFull, {
            // opacity: overlayValue,
            opacity: overlayOpacity,
            zIndex: zIndexValue,
          }]}
        >
          <TouchableOpacity
            style={[styles.positionFull, {
              zIndex: 3003,
              position: 'absolute',
            }]}
            onPress={this.onOverlayClick.bind(this)}
          >
          </TouchableOpacity>
        </Animated.View>
      </>
    );
  }
  handleDrawer(isOpen: boolean) {
    isOpen ? this.openDrawer() : this.closeDrawer();
  }
  getPosition() {
    const { drawerWidth, placement } = this.props;
    const xy = { x: 0, y: 0 };
    if (placement === 'left') {
      xy.x = -(drawerWidth || 0);
    }
    if (placement === 'right') {
      xy.x = (DEVICE_WIDTH || 0);
    }
    return xy;
  }
  openDrawer() {
    this.setState({ zIndexValue: 3002 });
    Animated.parallel([
      Animated.spring(this.state.drawerValue,
        {
          toValue: { x: 0, y: 0 },
          overshootClamping: true,
        }
      ),
      Animated.spring(this.state.overlayValue,
        { toValue: .7, overshootClamping: true }
      ),
    ]).start(() => {
      this.props.openDrawer!(true);
      this.props.onChange!(true);
    });
  }
  closeDrawer() {
    const { drawerWidth, placement } = this.props;
    const { drawerValue, overlayValue } = this.state;
    const xy = { x: 0, y: 0 };
    if (placement === 'left') {
      xy.x = -(drawerWidth || 0);
    }
    if (placement === 'right') {
      xy.x = (DEVICE_WIDTH || 0);
    }
    Animated.parallel([
      Animated.spring(drawerValue,
        {
          toValue: { ...(this.getPosition()) },
          overshootClamping: true,
        }
      ),
      Animated.spring(overlayValue,
        {
          toValue: 0,
          overshootClamping: true,
        }
      ),
    ]).start(() => {
      this.props.closeDrawer!(false);
      this.props.onChange!(false);
      this.setState({ zIndexValue: 0 });
    });
  }
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flex: 1,
    zIndex: 3004,
  },
  positionFull: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  overlay: {
    backgroundColor: '#000',
    zIndex: 3002,
  },
});