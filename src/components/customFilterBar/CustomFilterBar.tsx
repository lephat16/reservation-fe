import { alpha, FormControl, InputBase, styled, Toolbar } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import type React from "react";

type FilterBarProps = {
    searchText: string;
    onSearchChange: (text: string) => void;
    children?: React.ReactNode
};

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));
const FilterBar = ({ searchText, onSearchChange, children }: FilterBarProps) => (
    <Toolbar sx={{ width: '100%', display: "flex"}} >
        <Search>
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
                placeholder="検索..."
                inputProps={{ 'aria-label': 'search' }}
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </Search>
        {children && <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            {children}
        </FormControl>}
    </Toolbar>
);
export default FilterBar;
