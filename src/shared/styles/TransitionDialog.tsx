import type { TransitionProps } from "@mui/material/transitions";
import React from "react";
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default Transition;