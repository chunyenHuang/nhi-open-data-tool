import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { ResponsivePieCanvas } from '@nivo/pie';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
  },
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flex: 1,
  },
}));

function TextBox({ label, content, compare }) {
  return (
    <Box textAlign="center" fontWeight="fontWeightBold" p={2} m={2}>
      <Typography gutterBottom variant="h6" component="h1">
        {label}
      </Typography>
      <Typography gutterBottom variant="h4" component="h1" color="primary">
        {content}
      </Typography>
      {compare && compare !== 'NaN' &&
      <Typography gutterBottom variant="h6s" component="h1" color="textSecondary">
        {compare}
      </Typography>}
    </Box>);
}

TextBox.propTypes = {
  label: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  compare: PropTypes.string,
};

function Pie({ data = [] }) {
  return (
    <Box height={500}>
      <ResponsivePieCanvas
        data={data}
        margin={{ top: 40, right: 200, bottom: 40, left: 80 }}
        pixelRatio={1}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: 'paired' }}
        borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={16}
        radialLabelsLinkHorizontalLength={24}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{ from: 'color' }}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            translateX: 140,
            itemWidth: 60,
            itemHeight: 14,
            itemsSpacing: 2,
            symbolSize: 14,
            symbolShape: 'circle',
          },
        ]}
      />
    </Box>);
}

Pie.propTypes = {
  data: PropTypes.object.isRequired,
};

export default function Statistics({ data = {}, compareData = {}, hides = [] }) {
  const classes = useStyles();

  const orgData = data['醫療機構'];
  const orgCompareData = compareData['醫療機構'] || {};
  const priceData = data['自付差額'];
  const priceCompareData = compareData['自付差額'];

  if (!orgData || !priceData) return null;

  const orgTypeData = Object.keys(orgData['特約類別']).map((key) => {
    return {
      id: key,
      label: key,
      value: orgData['特約類別'][key],
    };
  });

  const orgLocationData = Object.keys(orgData['地區']).map((key) => {
    return {
      id: key,
      label: key,
      value: orgData['地區'][key],
    };
  });

  return (
    <div className={classes.root}>
      {!hides.includes('自付差額') &&
      <Grid container className={classes.container}>
        <Grid item xs={12} align="center">
          <Typography gutterBottom variant="subtitle1" component="h5" color="textSecondary">
            自付差額 {priceCompareData && <span> - 相較於此分類所有項目 (灰色部分)</span>}
          </Typography>
        </Grid>
        {priceData['健保給付點數'] &&
        <Grid item xs={12}>
          <TextBox
            label="健保給付點數"
            content={new Intl.NumberFormat().format(priceData['健保給付點數'])}
          />
        </Grid>}
        <Grid item xs={4}>
          <TextBox
            label="最低"
            content={new Intl.NumberFormat().format(priceData['最低'])}
            compare={priceCompareData && new Intl.NumberFormat().format(priceCompareData['最低'])}
          />
        </Grid>
        <Grid item xs={4}>
          <TextBox
            label="最高"
            content={new Intl.NumberFormat().format(priceData['最高'])}
            compare={priceCompareData && new Intl.NumberFormat().format(priceCompareData['最高'])}
          />
        </Grid>
        <Grid item xs={4}>
          <TextBox
            label="中位數"
            content={new Intl.NumberFormat().format(priceData['中位數'])}
            compare={priceCompareData && new Intl.NumberFormat().format(priceCompareData['中位數'])}
          />
        </Grid>
      </Grid>}
      {!hides.includes('醫療機構') &&
      <Grid container spacing={2} className={classes.container}>
        <Grid item xs={12} align="center">
          <Typography gutterBottom variant="subtitle1" component="h5" color="textSecondary">
            相關醫療機構 {orgData['總數']} 間 {orgCompareData['總數'] && <span> - 此分類共有 {orgCompareData['總數']} 間</span>}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Pie data={orgTypeData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Pie data={orgLocationData} />
        </Grid>
      </Grid>}
    </div>);
}

Statistics.propTypes = {
  data: PropTypes.object.isRequired,
  compareData: PropTypes.object,
  hides: PropTypes.array,
};
